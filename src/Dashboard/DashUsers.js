import React, { useEffect } from "react";
import MyModal from "../Modal";
import { CreateToast } from "../../App";
import { GETCOLLECTION, SETDOC, GETDOC, DELETEUSER } from "../../server";
import secureLocalStorage from "react-secure-storage";
import DataTable from "react-data-table-component";
import "./DashUsers.css";
export default function Users() {
  const [ActiveUser] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser"))
  );
  const [userList, setUserList] = React.useState([]);
  const [targetUser, setTargetUser] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handlePrimaryAction = (id, username) => {
    DeleteUser(id, username);
    handleCloseModal();
  };
  useEffect(() => {
    const fetchData = async () => {
      const UserList = await GETCOLLECTION("users");
      setUserList(UserList.filter((user) => user.deleteUser === false));
    };
    fetchData();
  }, []);
  const DeleteUser = async (id, Username) => {
    const targetUser = await GETDOC("users", id);
    await SETDOC("users", id, { ...targetUser, deleteUser: true });
    const UserList = await GETCOLLECTION("users");
    setUserList(UserList.filter((user) => user.deleteUser === false));
    CreateToast("user has been deleted", "success");
  };
  const MakeAdmin = async (id) => {
    let oldUser = await GETDOC("users", id);
    await SETDOC("users", id, {
      ...oldUser,
      admin: oldUser.admin ? false : true,
    });
    if (oldUser.admin) {
      CreateToast(`removed admin privileges to ${oldUser.Username}`, "success");
    }
    if (!oldUser.admin) {
      CreateToast(`added admin privileges to ${oldUser.Username}`, "success");
    }
    const UserList = await GETCOLLECTION("users");
    setUserList(UserList.filter((user) => user.deleteUser === false));
  };
  const columns = [
    {
      name: "ID",
      selector: (row) => row.id,
      sortable: true,
      center: true,
    },
    {
      name: "UserName",
      selector: (row) => row.UserName,
      sortable: true,
      center: true,
    },
    {
      name: "First Name",
      selector: (row) => row.FirstName,
      sortable: true,
      center: true,
    },
    {
      name: "Last Name",
      selector: (row) => row.LastName,
      sortable: true,
      center: true,
    },
    {
      name: "Joined At",
      selector: (row) => row.joinedAt,
      sortable: true,
      center: true,
    },
    {
      name: "Email",
      selector: (row) => row.Email,
      sortable: true,
      center: true,
      width: "220px",
    },
    {
      name: "Admin",
      selector: (row) => row.Admin,
      sortable: true,
      center: true,
    },
    {
      name: "Logged in",
      selector: (row) => row.loggedIn,
      sortable: true,
      center: true,
    },
    {
      name: "Options",
      selector: (row) => row.options,
      center: true,
      width: "250px",
    },
  ];
  const data = userList.map((User) => {
    return {
      id: User.id,
      UserName: User.Username,
      FirstName: User.Fname,
      LastName: User.Lname,
      joinedAt: User.joinedAt,
      Email: User.email,
      Admin: (
        <button
          onClick={() => {
            MakeAdmin(User.id);
          }}
        >
          {User.admin ? "Yes" : "No"}
        </button>
      ),
      loggedIn: User.Active ? "Yes" : "No",
      options: (
        <>
          <button
            onClick={() => {
              window.location.href = `Dashboard/User/${User.id}`;
            }}
          >
            Details
          </button>
          {User.id === ActiveUser.id ? (
            ""
          ) : (
            <button
              className="button Danger"
              onClick={() => {
                setTargetUser(User);
                handleShowModal();
              }}
            >
              Delete
            </button>
          )}
        </>
      ),
    };
  });
  return (
    <div className="Users">
      {showModal && (
        <MyModal
          show={showModal}
          handleClose={handleCloseModal}
          title="Delete Account"
          primaryButtonText={`Delete ${targetUser.Username}`}
          handlePrimaryAction={() => {
            handlePrimaryAction(targetUser.id, targetUser.Username);
          }}
        >
          <>
            <p style={{ textAlign: "center" }}>
              are you sure you want to delete {targetUser.Username}? this action
              is IRREVERSIBLE
            </p>
          </>
        </MyModal>
      )}
      <h1 className="animate__animated animate__backInDown">Users</h1>
      <DataTable
        className="animate__animated animate__fadeIn"
        style={{ animationDelay: ".4s" }}
        theme="dark"
        pagination
        highlightOnHover
        columns={columns}
        data={data}
      />
    </div>
  );
}
