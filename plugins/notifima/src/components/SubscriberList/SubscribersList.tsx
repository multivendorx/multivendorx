import Popup from "../Popup/Popup";
import { useState } from "react";
import { Dialog } from "@mui/material";
import { __ } from "@wordpress/i18n";
import "./subscribersList.scss";

const SubscribersList: React.FC = () => {
    const [openDialog, setOpenDialog] = useState(false);
    return (
        <>
            {!appLocalizer.khali_dabba ? (
                <div>
                    <div className="free-reports-download-section">
                        <h2 className="section-heading">
                            {__(
                                "Download product wise subscriber data.",
                                "notifima"
                            )}
                        </h2>
                        <button>
                            <a href={appLocalizer.export_button}>
                                {__("Download CSV", "notifima")}
                            </a>
                        </button>
                        <p
                            className="description"
                            dangerouslySetInnerHTML={{
                                __html: "This CSV file contains all subscriber data from your site. Upgrade to <a href='https://multivendorx.com/woocommerce-product-stock-manager-notifier-pro/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=stockmanager' target='_blank'>Notifima Pro</a> to generate CSV files based on specific products or users.",
                            }}
                        ></p>
                    </div>
                    <Dialog
                        className="admin-module-popup"
                        open={openDialog}
                        onClose={() => {
                            setOpenDialog(false);
                        }}
                        aria-labelledby="form-dialog-title"
                    >
                        <span
                            className="admin-font adminLib-cross stock-manager-popup-cross"
                            onClick={() => {
                                setOpenDialog(false);
                            }}
                        ></span>
                        <Popup />
                    </Dialog>
                    <div
                        className="subscriber-img"
                        onClick={() => {
                            setOpenDialog(true);
                        }}
                    ></div>
                </div>
            ) : (
                <div id="subscriber-list-table"></div>
            )}
        </>
    );
};

export default SubscribersList;
