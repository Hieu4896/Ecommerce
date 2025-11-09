import { useAuthStore } from "@src/store/authStore";
import { SessionUser } from "@src/types/auth.type";

const toSessionUser = (userData: SessionUser): SessionUser => {
  return {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    image: userData.image,
    name: `${userData.firstName} ${userData.lastName}`,
  };
};

/**
 * Kiểm tra xem user đã đăng nhập chưa
 * @returns boolean - true nếu đã đăng nhập, false nếu chưa
 * @throws Error nếu chưa đăng nhập
 */
const checkAuthentication = (): boolean => {
  const authStore = useAuthStore.getState();
  if (!authStore.isAuthenticated) {
    throw new Error("Vui lòng đăng nhập để sử dụng giỏ hàng");
  }
  return true;
};

export { toSessionUser, checkAuthentication };
