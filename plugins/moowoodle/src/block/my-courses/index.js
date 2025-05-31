import { createRoot } from '@wordpress/element';
import Courses from './course';
import axios from "axios";
// console.log("Axios test:", axios);

const node = document.getElementById( 'moowoodle-my-course' );

createRoot( node ).render( <Courses /> );