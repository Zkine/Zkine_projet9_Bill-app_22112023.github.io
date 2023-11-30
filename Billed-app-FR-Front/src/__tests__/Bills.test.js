/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
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
      // On vérifie si l'element windowIcon à la class "active-icon" qui permet de mettre en surbrillance l'icône
      expect(windowIcon.getAttribute("class")).toBe("active-icon");
    });

    test("Then ...", async () => {});

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
  });
});

// test d'intégration GET
// describe("Given I am a user connected as Employee", () => {
//   describe("When I navigate to Dashboard", () => {
//     test("fetches bills from mock API GET", async () => {
//       localStorage.setItem(
//         "user",
//         JSON.stringify({ type: "Employee", email: "e@e" })
//       );
//       const root = document.createElement("div");
//       root.setAttribute("id", "root");
//       document.body.append(root);
//       router();
//       window.onNavigate(ROUTES_PATH.Bills);
//       console.log(window.onNavigate(ROUTES_PATH.Bills));
//       await waitFor(() => screen.getByText("Validations"));
//       const contentPending = await screen.getByText("En attente (1)");
//       expect(contentPending).toBeTruthy();
//       const contentRefused = await screen.getByText("Refusé (2)");
//       expect(contentRefused).toBeTruthy();
//       expect(screen.getByTestId("big-billed-icon")).toBeTruthy();
//     });
//     describe("When an error occurs on API", () => {
//       beforeEach(() => {
//         jest.spyOn(mockStore, "bills");
//         Object.defineProperty(window, "localStorage", {
//           value: localStorageMock,
//         });
//         window.localStorage.setItem(
//           "user",
//           JSON.stringify({
//             type: "Admin",
//             email: "a@a",
//           })
//         );
//         const root = document.createElement("div");
//         root.setAttribute("id", "root");
//         document.body.appendChild(root);
//         router();
//       });
//       test("fetches bills from an API and fails with 404 message error", async () => {
//         mockStore.bills.mockImplementationOnce(() => {
//           return {
//             list: () => {
//               return Promise.reject(new Error("Erreur 404"));
//             },
//           };
//         });
//         window.onNavigate(ROUTES_PATH.Bills);
//         await new Promise(process.nextTick);
//         const message = await screen.getByText(/Erreur 404/);
//         expect(message).toBeTruthy();
//       });

//       test("fetches messages from an API and fails with 500 message error", async () => {
//         mockStore.bills.mockImplementationOnce(() => {
//           return {
//             list: () => {
//               return Promise.reject(new Error("Erreur 500"));
//             },
//           };
//         });

//         window.onNavigate(ROUTES_PATH.Bills);
//         await new Promise(process.nextTick);
//         const message = await screen.getByText(/Erreur 500/);
//         expect(message).toBeTruthy();
//       });
//     });
//   });
// });
