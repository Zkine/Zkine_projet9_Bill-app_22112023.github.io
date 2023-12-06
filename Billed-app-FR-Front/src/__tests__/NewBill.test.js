/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // test unitaire
    test("Then the form is present", () => {
      document.body.innerHTML = NewBillUI();
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });

    test("Then, should render Type de dépense", () => {
      const textType = screen.getByText("Type de dépense");
      expect(textType).toBeTruthy();
    });

    test("Then, should render Nom de la dépense", () => {
      const textNom = screen.getByText("Nom de la dépense");
      expect(textNom).toBeTruthy();
    });

    test("Then, should render Date", () => {
      const textDate = screen.getByText("Date");
      expect(textDate).toBeTruthy();
    });

    test("Then, should render Montant TTC ", () => {
      const textMontant = screen.getByText("Montant TTC");
      expect(textMontant).toBeTruthy();
    });

    test("Then, should render TVA", () => {
      const textTVA = screen.getByText("TVA");
      expect(textTVA).toBeTruthy();
    });

    test("Then, should render Commentaire", () => {
      const textCommentaire = screen.getByText("Commentaire");
      expect(textCommentaire).toBeTruthy();
    });

    test("Then, should render Justificatif", () => {
      const textJustificatif = screen.getByText("Justificatif");
      expect(textJustificatif).toBeTruthy();
    });
  });

  // test d'intégration
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    document.body.innerHTML = NewBillUI();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });
  describe("When I am on NewBill Page", () => {
    test("Then I validate the form", () => {
      const inputData = {
        typeDepense: "Hôtel et logement",
        nomDepense: "Vol",
        date: "2020-05-24",
        Montant: "200",
        TVA: "15",
        Commentaire: "Vol de Paris à Lisbonne avec hôtel demi pension",
        file: new File(["hello"], "hello.png", { type: "image/png" }),
      };

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const bill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const selectionText = screen.getByTestId("expense-type");
      fireEvent.click(selectionText, {
        target: { value: inputData.typeDepense },
      });
      expect(selectionText.value).toBe("Hôtel et logement");

      const selectionName = screen.getByTestId("expense-name");
      fireEvent.change(selectionName, {
        target: { value: inputData.nomDepense },
      });
      expect(selectionName.value).toBe("Vol");

      const selectionData = screen.getByTestId("datepicker");
      fireEvent.change(selectionData, {
        target: { value: inputData.date },
      });
      expect(selectionData.value).toBe("2020-05-24");

      const selectionMontant = screen.getByTestId("amount");
      fireEvent.change(selectionMontant, {
        target: { value: inputData.Montant },
      });
      expect(selectionMontant.value).toBe("200");

      const selectionTVA = screen.getByTestId("pct");
      fireEvent.change(selectionTVA, {
        target: { value: inputData.TVA },
      });
      expect(selectionTVA.value).toBe("15");

      const selectionCommentaire = screen.getByTestId("commentary");
      fireEvent.change(selectionCommentaire, {
        target: { value: inputData.Commentaire },
      });
      expect(selectionCommentaire.value).toBe(
        "Vol de Paris à Lisbonne avec hôtel demi pension"
      );

      const selectionJustificatif = screen.getByTestId("file");
      userEvent.upload(selectionJustificatif, inputData.file);
      expect(selectionJustificatif.files[0]).toStrictEqual(inputData.file);

      const form = screen.getByTestId("form-new-bill");

      const handleClickSubmit = jest.fn((e) => bill.handleSubmit(e));

      form.addEventListener("submit", handleClickSubmit);
      fireEvent.submit(form);
      expect(handleClickSubmit).toHaveBeenCalled();
    });
  });

  describe("When I am on NewBill Page", () => {
    test("Then I insert an image", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const store = mockStore;
      const bill = new NewBill({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage,
      });

      // document.body.innerHTML = NewBillUI();
      const selectionJustificatif = screen.getByTestId("file");
      const file = new File(["test"], "test.png", { type: "image/png" });

      const filePath = selectionJustificatif.value.split(/\\/g);
      const fileName = filePath[filePath.length - 1];
      const handleChangeFile = jest.fn((e) =>
        bill.handleChangeFile(e, fileName)
      );

      selectionJustificatif.addEventListener("change", handleChangeFile);
      userEvent.upload(selectionJustificatif, file);

      expect(handleChangeFile).toHaveBeenCalled();
    });
  });
});

// test d'intégration POST
jest.mock("../app/store", () => mockStore);
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills Page", () => {
    test("Then retrieve the invoices from the mock POST API", async () => {
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
      window.onNavigate(ROUTES_PATH.NewBill);

      const dataCreated = jest.spyOn(mockStore.bills(), "create");
      const bill = {
        type: "Hôtel et logement",
        name: "Nouvelle facture",
        date: "2023-12-06",
        amount: 200,
        pct: 20,
        vat: "20",
        fileName: "test.jpg",
        fileUrl: "https://test.jpg",
        commentary: "",
      };
      const result = await mockStore.bills().create(bill);

      expect(dataCreated).toHaveBeenCalled();
      expect(result).toEqual({
        fileUrl: "https://localhost:3456/images/test.jpg",
        key: "1234",
      });
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
      afterEach(() => {
        jest.clearAllMocks();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        const error = new Error("Erreur 404");
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick);
        await expect(mockStore.bills().create({})).rejects.toEqual(error);
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        const error = new Error("Erreur 500");
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick);
        await expect(mockStore.bills().create({})).rejects.toEqual(error);
      });
    });
  });
});
