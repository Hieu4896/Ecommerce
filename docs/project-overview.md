**Project Overview**

Build an e-commerce application where users can log in, browse products, add items to cart, and complete orders.

## **Technical Requirements**

- **React** (Required)
- **TypeScript** (Required)
- Other libraries are freely selectable

## **API**

- **Use DummyJSON API**: [https://dummyjson.com](https://dummyjson.com/)
- Refer to the API documentation to find and implement necessary endpoints

---

## **Implementation Requirements**

### **1. Login**

- Implement user authentication
- JWT token management
- Redirect to product page after login
- Protect cart page from unauthenticated access

### **2. Product List**

- Display product list
- **Infinite scroll**: Load additional products on scroll (20 items per load)
- **Search functionality**: Search by product name
- "Add to Cart" button for each product

### **3. Shopping Cart**

- Add products to cart
- View cart (for current logged-in user)
- Quantity adjustment
- Remove items
- Calculate total amount

### **4. Checkout Form (Simulation)**

> **Note: DummyJSON doesn't provide actual order APIs, so implement the ordering process as a simulation.**

- **Shipping Information**
  - Recipient: Name, Phone, Email
  - Address: Postal code, Street address, Detailed address
  - Delivery notes
- **Payment Information**
  - Payment method selection
  - Card details: Card number, Expiry date, CVV
  - Card number auto-formatting (e.g., 1234-5678-9012-3456)
- **Form Validation**
  - Required field validation
  - Email/Phone format validation
  - Real-time error display
- **Order Completion Simulation**
  - Display order summary
  - Confirm final amount
  - On order completion:
    - Update user information (PUT /users/{id}) to save shipping address
    - Clear cart (DELETE /carts/{id})
    - Display order confirmation screen

---

## **Additional Requirements**

- **Error Handling**: Proper handling of API errors, network failures
- **Loading States**: Display during data fetching

---

## **Evaluation Points**

### **Functional Implementation**

- Do all requirements work correctly?
- Is the API utilized appropriately?
- Are edge cases considered?

### **Code Quality**

- Is TypeScript used effectively?
- Is the component structure reasonable?
- Is the code reusable?

### **Technical Implementation**

- Is state management efficient?
- Is the authentication flow secure?
- Are performance optimizations considered?

### **Problem-Solving Skills**

- Did you understand and utilize the API documentation independently?
- Did you provide creative solutions within the given constraints?

---

## **Submission Method**

1. **GitHub Repository**
   - Upload to a public repository
   - README.md is required
2. **Required README.md Contents**
   - How to run the project
   - Folder structure
   - Challenges and considerations during implementation
3. **Deployment (Optional)**
   - Bonus points for deployment URL (Vercel, Netlify, etc.)

---

## **Notes**

- **DummyJSON API Limitations**:
  - Returns simulated responses without actual data changes
  - No Order-related endpoints - simulate ordering process using cart and user info updates
  - POST/PUT/DELETE requests return success responses but don't change actual DB
    - Please apply changes in local level if needed.
- Read the API documentation carefully to find and utilize necessary endpoints
- Test user accounts can be found in the API documentation
