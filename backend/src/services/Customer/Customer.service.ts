import { customerData } from "../../data/Customer/Customer.data.js";
import type {
  CreateBusinessCustomerInput,
  CustomerQueryInput,
  UpdateBusinessCustomerInput,
  UpdateRetailCustomerInput,
} from "../../validators/Customer/Customer.validator.js";

type RetailCustomerRecord = Awaited<ReturnType<typeof customerData.findRetailMany>>[number];
type BusinessCustomerRecord = Awaited<ReturnType<typeof customerData.findBusinessMany>>[number];

function mapRetailCustomer(customer: RetailCustomerRecord) {
  return {
    id: customer.id,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    isActive: customer.isActive,
    createdAt: customer.createdAt,
    orderCount: customer._count.orders,
    reviewCount: customer._count.reviews,
    loyalty: customer.loyaltyProfile
      ? {
          tier: customer.loyaltyProfile.tier,
          points: customer.loyaltyProfile.points,
          totalSpent: Number(customer.loyaltyProfile.totalSpent),
          orderCount: customer.loyaltyProfile.orderCount,
        }
      : null,
  };
}

function mapBusinessCustomer(customer: BusinessCustomerRecord) {
  return {
    id: customer.id,
    companyName: customer.companyName,
    taxCode: customer.taxCode,
    contactName: customer.contactName,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    note: customer.note,
    createdAt: customer.createdAt,
    quoteRequestCount: customer._count.quoteRequests,
    contractCount: customer._count.contracts,
    invoiceCount: customer._count.invoices,
    debtCount: customer._count.debts,
  };
}

export const customerService = {
  async getRetailCustomers(query: CustomerQueryInput) {
    const customers = await customerData.findRetailMany(query);
    return customers.map(mapRetailCustomer);
  },

  async updateRetailCustomer(id: number, input: UpdateRetailCustomerInput) {
    return mapRetailCustomer(await customerData.updateRetail(id, input));
  },

  async getBusinessCustomers(query: CustomerQueryInput) {
    const customers = await customerData.findBusinessMany(query);
    return customers.map(mapBusinessCustomer);
  },

  async createBusinessCustomer(input: CreateBusinessCustomerInput) {
    return mapBusinessCustomer(await customerData.createBusiness(input));
  },

  async updateBusinessCustomer(id: number, input: UpdateBusinessCustomerInput) {
    return mapBusinessCustomer(await customerData.updateBusiness(id, input));
  },
};
