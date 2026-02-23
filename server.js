// Import packages, initialize an express app, and define the port you will use
const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();
const PORT = 3000;

app.use(express.json());


// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Define routes and implement middleware here
function loggingRequest(req, res, next) {
  console.log(`${req.method} ${req.url}`);

  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request Body:', req.body);
  }

  next();
}

app.use(loggingRequest);

const menuItemValidation = [
  body("name")
    .exists({ checkFalsy: true }).withMessage("Name is required")
    .isString().withMessage("Name must be a string")
    .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long")
    .trim(),

  body("description")
    .exists({ checkFalsy: true }).withMessage("Description is required")
    .isString().withMessage("Description must be a string")
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters long")
    .trim(),

  body("price")
    .exists().withMessage("Price is required")
    .isFloat({ gt: 0 }).withMessage("Price must be a positive number")
    .toFloat(),

  body("category")
    .exists({ checkFalsy: true }).withMessage("Category is required")
    .isString().withMessage("Category must be a string")
    .isIn(["appetizer", "entree", "dessert", "beverage"]).withMessage("Category must be one of: appetizer, entree, dessert, beverage")
    .trim(),

  body("ingredients")
    .exists().withMessage("Ingredients are required")
    .isArray({ min: 1 }).withMessage("Ingredients must be an array with at least one item"),

  body("available")
    .optional()
    .isBoolean().withMessage("Available must be a boolean value")
    .toBoolean()
];

handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: "Validation failed",
      errors: errors.array()
     });
  }
  next();
}

function parseId(param) {
  const id = Number(param);
  if (Number.isInteger(id)) {
    return
  }
  return NaN;
}

function findMenuItemIndex(id) {
  return menuItems.findIndex(item => item.id === id);
}

function getNextId() {
  let maxId = 0;
  for (let i = 0; i < menuItems.length; i++) {
    if (menuItems[i].id > maxId) {
      maxId = menuItems[i].id;
    }
  }
  return maxId + 1;
}

function getAvailableValue(bodyObj){
  if (Object.prototype.hasOwnProperty.call(bodyObj, 'available')) {
    return bodyObj.available;
  }
  return true;
}

app,get("/menu", (req, res) => {
  res.json(menuItems);
});

app.get("/menu/:id", (req, res) => {
  const id = parseId(req.params.id);
  const item = menuItems.find(item => item.id === id);

  if (!item) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  return res.status(200).json(item);
});

app.post("/menu", menuItemValidation, handleValidationErrors, (req, res) => {
  const newItem = {
    id: getNextId(),
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    ingredients: req.body.ingredients,
    available: getAvailableValue(req.body)
  };

  menuItems.push(newItem);
  return res.status(201).json(newItem);
});

app.put("/menu/:id", menuItemValidation, handleValidationErrors, (req, res) => {
  const id = parseId(req.params.id);
  const index = findMenuItemIndex(id);

  if (index === -1) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  menuItems[index] = {
    id: id,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    ingredients: req.body.ingredients,
    available: getAvailableValue(req.body)
  };

  return res.status(200).json(menuItems[index]);
});

app.delete("/menu/:id", (req, res) => {
  const id = parseId(req.params.id);
  const index = findMenuItemIndex(id);

  if (index === -1) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  const deleted = menuItems.splice(index, 1)[0];
  return res.status(200).json({ message: "Menu item deleted", deleted: deleted});
});

app.listen(PORT, () => {
  console.log(`Restaurant API Server is running on port ${PORT}`);
});