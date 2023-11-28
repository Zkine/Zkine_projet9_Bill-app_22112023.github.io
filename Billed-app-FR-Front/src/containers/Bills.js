import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    // this.document n'est pas utilisisé
    // this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    new Logout({ document, localStorage, onNavigate });

    setTimeout(() => {
      const buttonNewBill = document.querySelector(
        `button[data-testid="btn-new-bill"]`
      );
      const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
      if (buttonNewBill) {
        buttonNewBill.addEventListener("click", this.handleClickNewBill);
      }
      if (iconEye) {
        iconEye.forEach((icon) => {
          icon.addEventListener("click", () => this.handleClickIconEye(icon));
        });
      }
    }, 200);
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    $("#modaleFile")
      .find(".modal-body")
      .html(
        `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
      );
    $("#modaleFile").modal("show");
  };

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot.map((doc) => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status),
              };
            } catch (e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e, "for", doc);
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status),
              };
            }
          });

          const antiChrono = (a, b) => (a > b ? 1 : -1);
          const datesSorted = [...bills].sort(antiChrono);
          console.log(datesSorted);
          console.log("length", bills.length);
          return datesSorted;
        });
    }
  };
}
