import { SUPPORT_INFO } from "@/config/constants";

export const CONTACT_INFO = {
  phone: SUPPORT_INFO.phone,
  email: SUPPORT_INFO.email,
  address: SUPPORT_INFO.address,
  fullAddress: `${SUPPORT_INFO.address.street}, ${SUPPORT_INFO.address.city} ${SUPPORT_INFO.address.postalCode}`,
};
