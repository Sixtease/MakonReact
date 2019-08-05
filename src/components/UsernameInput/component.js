import React from "react";
import { Field, reduxForm } from "redux-form";

export class UsernameInput extends React.Component {
  render() {
    return (
      <Field
        component="input"
        type="text"
        name="username"
        placeholder="vaše jméno"
      />
    );
  }
}

/* eslint no-class-assign: [0] */
UsernameInput = reduxForm({
  form: "username",
  initialValues: { username: localStorage.getItem("username") },
  onChange: values => localStorage.setItem("username", values.username)
})(UsernameInput);

export default UsernameInput;
