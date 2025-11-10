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
  ChildTrigger: React.ReactNode;
  handleClearCart: () => void;
}

export function CartDeletedConfirmation({
  ChildTrigger,
  handleClearCart,
}: CartDeletedConfirmationProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{ChildTrigger}</AlertDialogTrigger>
      <AlertDialogContent className="mobile:max-w-[90%]! laptop:max-w-[70%]!">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClearCart}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
