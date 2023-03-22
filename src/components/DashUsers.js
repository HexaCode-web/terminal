import React from "react";
import MyModal from "./Modal";
import { initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getFirestore,
  deleteDoc,
} from "firebase/firestore";
import DB from "../DBConfig.json";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import secureLocalStorage from "react-secure-storage";
const app = initializeApp(DB.firebaseConfig);
const db = getFirestore(app);

export default function Users(props) {
  const [ActiveUser] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser"))
  );
  const [showModal, setShowModal] = React.useState(false);
  const [adminFormStatus, setAdminFormStatus] = React.useState("");
  const [newAdmin, setNewAdmin] = React.useState({
    Active: false,
    Lname: "",
    Fname: "",
    address: "",
    admin: true,
    cart: [],
    dateOfBirth: "",
    email: "",
    gender: "",
    history: [],
    joinedAt:
      new Date().getDate() +
      "/" +
      (new Date().getMonth() + 1) +
      "/" +
      (new Date().getYear() - 100),
    Username: "",
    Password: "",
    wishlist: [],
    phone: "",
  });
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handlePrimaryAction = (e) => {
    SignupAdmin(e);
    if (
      adminFormStatus === "this userName is taken, please try a new UserName" ||
      adminFormStatus === ""
    ) {
      return;
    } else {
      handleCloseModal();
    }
  };

  const DeleteUser = async (id, Username) => {
    if (
      confirm(
        `are you sure you want to delete user ${Username} THIS ACTION IS IRREVERSIBLE`
      ) === true
    ) {
      await deleteDoc(doc(db, "users", id.toString()));
      window.location.reload();
    } else {
      return;
    }
  };
  const SignupAdmin = async (e) => {
    e.preventDefault();
    setAdminFormStatus("");
    const srcData = await getDocs(collection(db, "users"));
    const cleanData = [];
    let id;
    srcData.forEach((doc) => {
      const info = doc.data();
      cleanData.push(info);
      id = info.id + 1;
    });

    if (
      cleanData.some((data) => {
        return data.Username === newAdmin.Username;
      })
    ) {
      setAdminFormStatus("this userName is taken, please try a new UserName");
      toast.error("this username is taken!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    } else {
      setDoc(doc(db, "users", id.toString()), { ...newAdmin, id });
      toast.success("Created the Admin User!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };
  const UserListEl = props.UserList.map((User) => {
    let HistoryValue = 0;
    let CartValue = 0;
    let DiscountGot = 0;
    User.history.map((product) => {
      DiscountGot += +(product.price * product.discountPercentage) / 100;
      HistoryValue += +product.price;
    });
    User.cart.map((product) => (CartValue += +product.price));

    return (
      <tr>
        <th scope="row" className="d-none">
          {User.id}
        </th>
        <td>{User.Username}</td>
        <td>{User.Fname}</td>
        <td>{User.Lname}</td>
        <td>{User.address}</td>
        <td>{User.joinedAt}</td>
        <td>{User.dateOfBirth}</td>
        <td>{User.email}</td>
        <td>{User.gender}</td>
        <td>{User.admin ? "Yes" : "No"}</td>
        <td>{User.Active ? "Yes" : "No"}</td>
        <td>{CartValue}$</td>
        <td>{HistoryValue}$</td>
        <td>{Math.round(DiscountGot)}$</td>
        <td>{User.wishlist.length}</td>
        <td>
          {User.id === ActiveUser.id ? (
            ""
          ) : (
            <button
              className="btn btn-danger"
              onClick={() => {
                DeleteUser(User.id, User.Username);
              }}
            >
              Delete
            </button>
          )}
        </td>
      </tr>
    );
  });
  const handleAdminChange = (event) => {
    const { name, value } = event.target;
    setNewAdmin((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  return (
    <div className="Users">
      <h1>Users</h1>
      <button
        className="btn"
        onClick={handleShowModal}
        style={{ margin: "auto" }}
      >
        Add Admin
      </button>
      <MyModal
        show={showModal}
        handleClose={handleCloseModal}
        title="Create an admin"
        primaryButtonText="Add Admin"
        handlePrimaryAction={handlePrimaryAction}
      >
        <>
          <form className="AddAdmin-form">
            <div className="formItem">
              <label for="username">Username:</label>
              <input
                type="text"
                id="username"
                name="Username"
                value={newAdmin.Username}
                onChange={handleAdminChange}
              />
            </div>
            <div className="formItem">
              <label for="password">Password:</label>
              <input
                type="password"
                id="password"
                name="Password"
                value={newAdmin.Password}
                onChange={handleAdminChange}
              />
            </div>
          </form>
        </>
      </MyModal>
      <div className="table-responsive">
        <table class="table table-dark table-striped text-center">
          <thead>
            <tr>
              <th scope="col">UserName</th>
              <th scope="col">First Name</th>
              <th scope="col">Last Name</th>
              <th scope="col">address</th>
              <th scope="col">joined At</th>
              <th scope="col">Date of Birth</th>
              <th scope="col">Email</th>
              <th scope="col">Gender</th>
              <th scope="col">Admin</th>
              <th scope="col">Logged in</th>
              <th scope="col">Cart Amount</th>
              <th scope="col">History Amount</th>
              <th scope="col">Total Discount Amount</th>
              <th scope="col">WishList Amount</th>
              <th scope="col">Delete User</th>
            </tr>
          </thead>
          <tbody>{UserListEl}</tbody>
        </table>
      </div>
    </div>
  );
}
