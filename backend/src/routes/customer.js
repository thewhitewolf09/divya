import { Router } from "express";
import { auth } from "../middlewares/index.js";
import {
  createCustomer,
  deleteCustomer,
  filterCustomersByCreditBalance,
  filterCustomersByDateRange,
  filterCustomersByMembershipStatus,
  filterCustomersByTotalPurchases,
  getAllCustomers,
  getCustomerDetails,
  getOutstandingCredit,
  searchCustomersByName,
  updateCustomerDetails,
} from "../controllers/customer/index.js";
import {
  addDailyItemForCustomer,
  getCustomerMembershipSummary,
  getDailyItemAttendance,
  recordDailyItemAttendance,
  removeDailyItemForCustomer,
  updateDailyItemQuantity,
  updateMembershipStatus,
} from "../controllers/membership/index.js";

const router = Router();

router.get("/all", getAllCustomers);
router.post("/add", auth, createCustomer);
router.get("/:id", getCustomerDetails);
router.put("/:id", auth, updateCustomerDetails);
router.delete("/:id", auth, deleteCustomer);
router.get("/search", searchCustomersByName);
router.get("/filter/date-range", filterCustomersByDateRange);
router.get("/filter/membership-status", filterCustomersByMembershipStatus);
router.get("/filter/total-purchases", filterCustomersByTotalPurchases);
router.get("/filter/credit-balance", filterCustomersByCreditBalance);
router.get("/:id/credit/outstanding", getOutstandingCredit);

//membership
router.get("/:id/daily-items/attendance", getDailyItemAttendance);
router.patch(
  "/:id/daily-items/:itemName/quantity",
  auth,
  updateDailyItemQuantity
);
router.post(
  "/:id/daily-items/:itemName/attendance",
  auth,
  recordDailyItemAttendance
);
router.get("/:id/membership-summary", getCustomerMembershipSummary);
router.patch("/:id/membership", auth, updateMembershipStatus);
router.post("/:id/daily-items", auth, addDailyItemForCustomer); 
router.delete("/:id/daily-items/:itemName", auth, removeDailyItemForCustomer);

export default router; 
