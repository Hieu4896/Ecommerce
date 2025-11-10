import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@components/alert-dialog";

interface CartDeletedConfirmationProps {
  childTrigger: React.ReactNode;
  handleClearCart: () => void;
}

export function CartDeletedConfirmation({
  childTrigger,
  handleClearCart,
}: CartDeletedConfirmationProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{childTrigger}</AlertDialogTrigger>
      <AlertDialogContent className="mobile:max-w-[90%] tablet:max-w-[40%]! laptop:max-w-[30%]!">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-primary">Bạn muốn xóa giỏ hàng?</AlertDialogTitle>
          <AlertDialogDescription>Giỏ hàng sẽ bị xóa tất cả dữ liệu.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="flex-1">Hủy</AlertDialogCancel>
          <AlertDialogAction className="flex-1" onClick={handleClearCart}>
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
