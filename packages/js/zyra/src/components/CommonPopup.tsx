import { ReactNode, forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import "../styles/web/CommonPopup.scss";
// Slide transition from the right
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

type PopupProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  height?: number | string;
};

const CommonPopup = ({
  open,
  onClose,
  children,
  header,
  footer,
  width,
  height = "fit-content"
}: PopupProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      PaperProps={{
        sx: {
          margin: 0,
          height: height,
          minWidth: width,
          width: width,
          position: "fixed",
          right: '1rem',
          bottom: '1rem',
          borderRadius: '0.313rem',
        },
      }}
      hideBackdrop={false}
    >
      {header && <div className="title-wrapper">{header}</div>}


      <DialogContent>
        <div>{children}</div>
      </DialogContent>
      
      {footer && <DialogActions className="popup-footer">{footer}</DialogActions>}
    </Dialog>
  );
};

export default CommonPopup;
