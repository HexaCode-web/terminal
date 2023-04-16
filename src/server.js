import React, { useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getFirestore,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import DB from "./DBConfig.json";
const app = initializeApp(DB.firebaseConfig);
const db = getFirestore(app);
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
    throw new Error("No data found");
  } else {
    await setDoc(doc(db, collection, id.toString()), newValue);
  }
};
//         SETDOC("users", tempData.id, { ...tempData });

export const DELETEDOC = async (collection = String, id = Number) => {
  try {
    await deleteDoc(doc(db, collection, id.toString()));
  } catch (error) {
    return error;
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
