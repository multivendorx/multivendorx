/* global appLocalizer */
import React, { useEffect, useState } from "react";
import { __ } from "@wordpress/i18n";
import { CommonPopup, getApiLink, TableCell } from "zyra";
import axios from "axios";

interface QnaItem {
  id: number;
  product_id: number;
  product_name: string;
  product_link: string;
  question_text: string;
  answer_text: string | null;
  question_by: number;
  author_name: string;
  question_date: string;
  time_ago: string;
  total_votes: number;
  question_visibility: string;
}

interface EditQnaProps {
  open: boolean;
  onClose: () => void;
  qnaId?: number | null;
}

const EditQna: React.FC<EditQnaProps> = ({ open, onClose, qnaId }) => {
  const [qna, setQna] = useState<QnaItem | null>(null);

  useEffect(() => {
    if (qnaId) {
      axios({
        method: "GET",
        url: getApiLink(appLocalizer, `qna/${qnaId}`),
        headers: { "X-WP-Nonce": appLocalizer.nonce },
      }).then((res) => {
        setQna(res.data || null);
      });
    }
  }, [qnaId]);

  return (
    <CommonPopup
      open={open}
      onClose={onClose}
      width="800px"
      height="100%"
      header={
        <>
          <div className="title">
            <i className="adminlib-comment"></i>
            {__("View Question", "multivendorx")} {qna ? `#${qna.id}` : ""}
          </div>
          <p>
            {__("Details of this question including product, user, and answer.", "multivendorx")}
          </p>
          <i onClick={onClose} className="icon adminlib-close"></i>
        </>
      }
      footer={
        <>
          <div onClick={onClose} className="admin-btn btn-red">
            {__("Close", "multivendorx")}
          </div>
        </>
      }
    >
      {qna ? (
        <div className="content multi">
          <div className="section left">
            <div className="heading">{__("Product Details", "multivendorx")}</div>
            <div className="vendor-details">
              <div className="name">
                <a href={qna.product_link} target="_blank" rel="noreferrer">
                  {qna.product_name}
                </a>
              </div>
              <div className="details">
                <div className="id">
                  <b>Product ID:</b> {qna.product_id}
                </div>
              </div>
            </div>

            <div className="popup-divider"></div>

            <div className="heading">{__("Question & Answer", "multivendorx")}</div>
            <div className="settings-metabox-note">
              <i className="adminlib-help"></i>
              <p><b>Q:</b> {qna.question_text}</p>
            </div>
            <div className="settings-metabox-note">
              <i className="adminlib-check"></i>
              <p><b>A:</b> {qna.answer_text ?? __("Not answered yet", "multivendorx")}</p>
            </div>
          </div>

          <div className="section right">
            <div className="heading">{__("Question Overview", "multivendorx")}</div>
            <div className="commission-details">
              <div className="items">
                <div className="text">Asked By</div>
                <div className="value">{qna.author_name}</div>
              </div>
              <div className="items">
                <div className="text">Date</div>
                <div className="value">{qna.question_date}</div>
              </div>
              <div className="items">
                <div className="text">Time Ago</div>
                <div className="value">{qna.time_ago}</div>
              </div>
              <div className="items">
                <div className="text">Votes</div>
                <div className="value">{qna.total_votes}</div>
              </div>
              <div className="items">
                <div className="text">Visibility</div>
                <div className="value">
                  <span className="admin-badge blue">{qna.question_visibility}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading">{__("Loading...", "multivendorx")}</div>
      )}
    </CommonPopup>
  );
};

export default EditQna;
