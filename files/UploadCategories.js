import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const predefinedCategories = [
  {
    id: "grains",
    name: "Grains",
    icon: "nutrition-outline",
    color: "#F8B951",
  },
  {
    id: "fruits",
    name: "Fruits",
    icon: "leaf-outline",
    color: "#E7625F",
  },
  {
    id: "vegetables",
    name: "Vegetables",
    icon: "flower-outline",
    color: "#55C2AC",
  },
  {
    id: "oilseeds",
    name: "Oilseeds",
    icon: "water-outline",
    color: "#9F5BCC",
  },
  {
    id: "milk-products",
    name: "Milk Products",
    icon: "cafe-outline",
    color: "#4A8FE7",
  },
];

const uploadCategories = async () => {
  try {
    for (const category of predefinedCategories) {
      await setDoc(doc(collection(db, "Category"), category.id), category);
    }
    console.log("Categories uploaded successfully");
  } catch (error) {
    console.error("Error uploading categories:", error);
  }
};

export default uploadCategories;
