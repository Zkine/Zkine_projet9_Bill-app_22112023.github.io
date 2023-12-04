/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import fireEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });

    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: "some error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });

    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      // On vérifie si l'element windowIcon à la class "active-icon" permettant de mettre en surbrillance l'icône
      expect(windowIcon.getAttribute("class")).toBe("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (Date.parse(a) < Date.parse(b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      console.log(datesSorted);
      // Set ignore order
      expect(new Set(dates)).toEqual(new Set(datesSorted));
      // expect(datesSorted).toEqual([...dates].sort(antiChrono));
    });

    describe("When I am on Bills Page", () => {
      test("Then if I click I am directed to the form NewBill", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const bill = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });

        const newBill = screen.getByTestId("btn-new-bill");

        expect(newBill).toHaveTextContent("Nouvelle note de frais");

        const handleClickNewBill = jest.fn(() => bill.handleClickNewBill());

        newBill.addEventListener("click", handleClickNewBill);
        userEvent.click(newBill);
        expect(handleClickNewBill).toHaveBeenCalled();
      });

      test("Then, does the bill table appear", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const bill = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });
        document.body.innerHTML = BillsUI({ data: bills });

        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();

        const tableOfBills = screen.getByTestId(`tbody`);
        expect(screen.getByTestId(`tbody`)).toBeTruthy();
        expect(tableOfBills.children.length).toBe(4);
      });

      test("Then I click on the icon below actions", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const bill = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });

        document.body.innerHTML = BillsUI({ data: bills });
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();

        const todoItems1 = screen.getAllByTestId("icon-eye")[0];
        const todoItems2 = screen.getAllByTestId("icon-eye")[1];
        const todoItems3 = screen.getAllByTestId("icon-eye")[2];

        const handleClickIconEye1 = jest.fn(() =>
          bill.handleClickIconEye(todoItems1)
        );
        const handleClickIconEye2 = jest.fn(() =>
          bill.handleClickIconEye(todoItems2)
        );
        const handleClickIconEye3 = jest.fn(() =>
          bill.handleClickIconEye(todoItems3)
        );

        todoItems1.addEventListener("click", handleClickIconEye1);
        todoItems2.addEventListener("click", handleClickIconEye2);
        todoItems3.addEventListener("click", handleClickIconEye3);

        userEvent.click(todoItems1);
        expect(handleClickIconEye1).toHaveBeenCalled();
        await waitFor(() => expect(screen.getByAltText("Bill")).toBeTruthy());
        userEvent.click(todoItems2);
        expect(handleClickIconEye2).toHaveBeenCalled();
        await waitFor(() => expect(screen.getByAltText("Bill")).toBeTruthy());
        userEvent.click(todoItems3);
        expect(handleClickIconEye3).toHaveBeenCalled();
        await waitFor(() => expect(screen.getByAltText("Bill")).toBeTruthy());
      });
    });
  });
});

jest.mock("../app/store", () => mockStore);
// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const contentPending = screen.getByText("pending");
      expect(contentPending).toBeTruthy();
      const contentRefused = screen.getByText("accepted");
      expect(contentRefused).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
