import { initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getFirestore,
  getDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
  updateEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { firebaseConfig } from "./DBConfig.js";
export const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
export const UPLOADPHOTO = async (path, photo) => {
  const snapshot = await uploadBytes(ref(storage, path), photo);
  const url = await getDownloadURL(snapshot.ref);
  return url;
};
export const DELETEPHOTO = async (path) => {
  await deleteObject(ref(storage, path));
};
export const GETCOLLECTION = async (target) => {
  try {
    const cleanData = [];
    const srcData = await getDocs(collection(db, target));
    srcData.forEach((doc) => {
      const info = doc.data();
      cleanData.push(info);
    });
    return cleanData;
  } catch (error) {
    return error;
  }
};
/** 
    await GETCOLLECTION("users").then((response) => {
   cleanData = response;
});
*/
export const QUERY = async (collectionName, propertyInDB, operation, value) => {
  try {
    const q = query(
      collection(db, collectionName),
      where(propertyInDB, operation, value)
    );

    const querySnapshot = await getDocs(q);

    const matches = [];

    querySnapshot.forEach((doc) => {
      matches.push(doc.data());
    });

    return matches;
  } catch (error) {
    console.error("Error during query:", error);
  }
};
export const UPDATEEMAIL = async (newEmail = "") => {
  try {
    onAuthStateChanged(auth, (user) => {
      updateEmail(user, newEmail);
    });
    return "Email updated successfully";
  } catch (error) {
    throw new Error(error.message);
  }
};

export const SIGNOUT = () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      console.log(error);
    });
};

export const LOGIN = async (Email, Password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      Email,
      Password
    );
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const NEWUSER = async (Email, Password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      Email,
      Password
    );
    const user = userCredential.user;
    return user;
  } catch (error) {
    throw error.message;
  }
};
export const DELETEUSER = async (id) => {
  const userToDelete = await GETDOC("users", id);
  await SETDOC("users", id, { ...userToDelete, deleteUser: true });
  try {
    return "user Deleted";
  } catch (error) {
    throw error.message;
  }
};
export const DELETECURRENTUSER = async () => {
  const user = auth.currentUser;
  deleteUser(user).catch((error) => {
    console.log(error);
  });
};
export const RESETPASSWORD = (email) => {
  sendPasswordResetEmail(auth, email)
    .then(() => {
      // Email sent.
      console.log("Password reset email sent successfully");
    })
    .catch((error) => {
      console.log(error);
      // An error happened.
    });
};
export const GETDOC = async (collection = String, id = Number) => {
  try {
    const docSnap = await getDoc(doc(db, collection, id.toString()));
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return "Error";
    }
  } catch (error) {
    return error;
  }
};
//      GETDOC("users", user.id).then((value) => { });
export const SETDOC = async (
  collection = String,
  id = Number,
  newValue = Object,
  New = ""
) => {
  if (New) {
    await setDoc(doc(db, collection, id.toString()), newValue);
  }
  const res = await GETDOC(collection, id);
  if (res === "Error") {
    throw new Error(`No data found in ${collection} with the id of ${id}`);
  } else {
    await setDoc(doc(db, collection, id.toString()), newValue);
  }
};
//         SETDOC("users", tempData.id, { ...tempData });

export const DELETEDOC = async (collection = String, id = Number) => {
  try {
    await deleteDoc(doc(db, collection, id.toString()));
  } catch (error) {
    console.log(error);
  }
};
export function productDistributor(productList = [], CategoryContainer = []) {
  CategoryContainer.forEach((category) => {
    category.products = [];
  });
  productList.forEach((product) => {
    CategoryContainer.forEach((Container) => {
      if (product.category === Container.Name) {
        if (Container.products.length === 0) {
          Container.products.push(product);
        } else {
          if (
            Container.products.find(
              (innerProduct) => innerProduct.id == product.id
            )
          ) {
            return;
          } else {
            Container.products.push(product);
          }
        }
      }
    });
  });
  for (let index = 0; index < CategoryContainer.length; index++) {
    setTimeout(() => {
      SETDOC("categories", CategoryContainer[index].id, {
        ...CategoryContainer[index],
      });
    }, 500);
  }
}
