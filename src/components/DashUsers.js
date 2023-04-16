import React, { useEffect } from "react";
import MyModal from "./Modal";
import { CreateToast } from "../App";
import { GETCOLLECTION, SETDOC, DELETEDOC } from "../server";
import secureLocalStorage from "react-secure-storage";
import sortBy from "sort-by";
export default function Users(props) {
  const [ActiveUser] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser"))
  );
  const [userList, setUserList] = React.useState([]);
  const [showModals, setShowModals] = React.useState({
    AddAdmin: false,
    DeleteUser: false,
  });
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
  const handleShowModal = (modal) => {
    if (modal === "Admin") {
      setShowModals((prev) => {
        return { ...prev, AddAdmin: true };
      });
    } else {
      setShowModals((prev) => {
        return { ...prev, DeleteUser: true };
      });
    }
  };
  const handleCloseModal = (modal) => {
    if (modal === "Admin") {
      setShowModals((prev) => {
        return { ...prev, AddAdmin: false };
      });
    } else {
      setShowModals((prev) => {
        return { ...prev, DeleteUser: false };
      });
    }
  };
  const handlePrimaryActionDelete = (id, username) => {
    DeleteUser(id, username);
    handleCloseModal("Delete");
  };
  const handlePrimaryActionAdmin = (e) => {
    SignupAdmin(e);
    if (
      adminFormStatus === "this userName is taken, please try a new UserName" ||
      adminFormStatus === ""
    ) {
      return;
    } else {
      handleCloseModal("Admin");
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      setUserList(await GETCOLLECTION("users"));
    };
    fetchData();
  }, []);
  const DeleteUser = async (id, Username) => {
    await DELETEDOC("users", id);
    setUserList(await GETCOLLECTION("users"));
    CreateToast("user has been deleted", "success");
  };
  const SignupAdmin = async (e) => {
    e.preventDefault();
    setAdminFormStatus("");
    let id;
    let cleanData = [];
    await GETCOLLECTION("users").then((response) => {
      cleanData = response;
    });
    cleanData.sort(sortBy("id"));
    cleanData.forEach((user) => {
      id = +user.id + 1;
    });
    if (
      cleanData.some((data) => {
        return data.Username === newAdmin.Username;
      })
    ) {
      setAdminFormStatus("this userName is taken, please try a new UserName");
      CreateToast("this username is taken!", "error");
      return;
    } else {
      SETDOC("users", id, { ...newAdmin, id });
      CreateToast("Created the Admin User!", "success");
      handleCloseModal("Admin");
    }
  };

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
        onClick={() => {
          handleShowModal("Admin");
        }}
        style={{ margin: "auto" }}
      >
        Add Admin
      </button>
      <MyModal
        show={showModals.AddAdmin}
        handleClose={() => {
          handleCloseModal("Admin");
        }}
        title="Create an admin"
        primaryButtonText="Add Admin"
        handlePrimaryAction={handlePrimaryActionAdmin}
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
        <table class="table table-dark table-striped text-center align-middle">
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
          <tbody>
            {userList &&
              userList.map((User) => {
                let HistoryValue = 0;
                let CartValue = 0;
                let DiscountGot = 0;
                User.history.map((product) => {
                  DiscountGot +=
                    +(product.price * product.discountPercentage) / 100;
                  HistoryValue += +product.price;
                });
                User.cart.map((product) => (CartValue += +product.price));
                return (
                  <tr key={User.id}>
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
                        <>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              handleShowModal("delete");
                            }}
                            style={{ margin: "auto" }}
                          >
                            delete Account
                          </button>
                          <MyModal
                            show={showModals.DeleteUser}
                            handleClose={() => {
                              handleCloseModal("delete");
                            }}
                            title="Delete Account"
                            primaryButtonText="Delete my account"
                            handlePrimaryAction={() => {
                              handlePrimaryActionDelete(User.id, User.Username);
                            }}
                          >
                            <>
                              <p style={{ textAlign: "center" }}>
                                are you sure you want to delete {User.Username}?
                                this action is IRREVERSIBLE
                              </p>
                            </>
                          </MyModal>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
