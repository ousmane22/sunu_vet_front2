export type {
  BusinessDashboardStats,
  BusinessDashboardResponse,
  DashboardActivity,
  DashboardAppointment,
} from './dashboard.model';

export type {
  BusinessProfile,
  BusinessProfileResponse,
  BusinessProfileUpdatePayload,
  ActiveSubscriptionProfile,
  SubscriptionPlanProfile,
} from './business.model';

export type {
  StaffMember,
  StaffRoleOption,
  StaffListResponse,
  StaffMemberResponse,
  CreateStaffPayload,
  UpdateStaffPayload,
} from './staff.model';

export type {
  BusinessRole,
  BusinessRoleListResponse,
  BusinessRoleSingleResponse,
  CreateBusinessRolePayload,
  UpdateBusinessRolePayload,
  AvailablePermissionsResponse,
  GroupedPermissionsResponse,
  PermissionOption,
  PermissionGroup,
} from './business-role.model';

export type {
  Product,
  PosProduct,
  PosProductListResponse,
  PosProductFilters,
  ProductType,
  ProductTypesListResponse,
  ProductListResponse,
  ProductSingleResponse,
  ProductStatsResponse,
  ProductStats,
  StockMovement,
  StockMovementListResponse,
  AdjustStockPayload,
  CreateProductPayload,
  UpdateProductPayload,
  ProductFilters,
  Category,
  CategoryListResponse,
  CategorySingleResponse,
  MedicationReference,
  MedicationReferenceListResponse,
  CreateProductFromReferencePayload,
  CreateFromCatalogueBulkResponse,
} from './product.model';

export type {
  CashRegister,
  CashTransaction,
  CashRegisterSingleResponse,
  OpenCashRegisterPayload,
  CloseCashRegisterPayload,
} from './cash-register.model';

export type {
  Payment,
  Sale,
  SaleListItem,
  SaleItem,
  SalePayment,
  SaleClient,
  Client,
  ClientDetail,
  ClientListResponse,
  ClientSingleResponse,
  SaleListResponse,
  SaleSingleResponse,
  CreateSalePayload,
  AddPaymentPayload,
} from './sale.model';

export type {
  Consultation,
  ConsultationListResponse,
} from './consultation.model';

export type {
  AnimalSpecies,
  AnimalSpeciesListResponse,
} from './animal-species.model';

export type {
  Expense,
  CreateExpensePayload,
  ExpenseListResponse,
} from './expense.model';

export type {
  Quote,
  QuoteItem,
  QuoteStatus,
  QuoteType,
  QuoteListResponse,
  CreateQuotePayload
} from './quote.model';

export type {
  InventorySession,
  InventoryLine,
  InventoryListResponse,
  InventoryLineUpdatePayload,
  InventorySessionStatus,
} from './inventory.model';




