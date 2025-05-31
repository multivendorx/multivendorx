
import React, { useEffect, useState, useCallback } from "react";
import { __, sprintf } from "@wordpress/i18n";
import axios from "axios";
import { getApiLink } from "zyra";

interface Course {
  user_name?: string;
  course_name?: string;
  enrolment_date?: string;
  password?: string;
  moodle_url?: string;
}

const Courses: React.FC = () => {
    console.log('Courses component mounted');

    const [courses, setCourses] = useState<Course[]>([]);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage] = useState<number>(5);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const totalPages = Math.ceil(totalRows / rowsPerPage);

    useEffect(() => {
    console.log("useEffect triggered");

    try {
        if (typeof courseMyAcc === "undefined") {
            console.error("courseMyAcc is not defined");
            return;
        }

        const apiUrl = `${courseMyAcc.apiUrl}/moowoodle/v1/my-acc-courses`;
        console.log("Request URL:", apiUrl);
        
        // axios({
        //     method: "GET",
        //     url: apiUrl,
        //     headers: { "X-WP-Nonce": courseMyAcc.nonce },
        //     params: { count: true },
        // })
        // .then((res) => {
        //     console.log("Axios response:", res.data);
        // })
        // .catch((error) => {
        //     console.error("Axios caught error:", error);
        // });

    } catch (e) {
        console.error("JavaScript runtime error in axios block:", e);
    }
}, []);


const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5}>{__("Loading...", "moowoodle")}</td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={5} className="error-row">
            {error}
          </td>
        </tr>
      );
    }

    if (!courses.length) {
      return (
        <tr>
          <td colSpan={5} className="no-data-row">
            {__("You haven't purchased any courses yet.", "moowoodle")}
          </td>
        </tr>
      );
    }

    return courses.map((course, index) => (
      <tr key={index}>
        <td data-label={__("Username", "moowoodle")}>
          {course.user_name || __("N/A", "moowoodle")}
        </td>
        <td data-label={__("Course Name", "moowoodle")}>
          {course.course_name || __("Unknown Course", "moowoodle")}
        </td>
        <td data-label={__("Enrolment Date", "moowoodle")}>
          {course.enrolment_date || __("No Date Available", "moowoodle")}
        </td>
        <td data-label={__("Password (First Time Login only)", "moowoodle")}>
          {course.password || __("Password not Available", "moowoodle")}
        </td>
        <td data-label={__("Action", "moowoodle")}>
          {course.moodle_url ? (
            <a
              href={course.moodle_url}
              target="_blank"
              rel="noopener noreferrer"
              className="woocommerce-button wp-element-button moowoodle"
            >
              {__("View", "moowoodle")}
            </a>
          ) : (
            <span className="disabled">{__("No Link", "moowoodle")}</span>
          )}
        </td>
      </tr>
    ));
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        <button
          disabled={currentPage === 1 || loading}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          {__("Previous", "moowoodle")}
        </button>
        <span>
          {sprintf(__("Page %d of %d", "moowoodle"), currentPage, totalPages)}
        </span>
        <button
          disabled={currentPage === totalPages || loading}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        >
          {__("Next", "moowoodle")}
        </button>
      </div>
    );
  };

    return (
        <div className="moowoodle-my-courses">
            <h1>hellooooooooo</h1>
            <table className="moowoodle-table shop_table shop_table_responsive my_account_orders">
            <thead>
                <tr>
                <th>{__("Username", "moowoodle")}</th>
                <th>{__("Course Name", "moowoodle")}</th>
                <th>{__("Enrolment Date", "moowoodle")}</th>
                <th>{__("Password (First Time Login only)", "moowoodle")}</th>
                <th>{__("Action", "moowoodle")}</th>
                </tr>
            </thead>
            <tbody>{renderTableContent()}</tbody>
            </table>
    
            {renderPagination()}
        </div>
    );
};


export default Courses;
