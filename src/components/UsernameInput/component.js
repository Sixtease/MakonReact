import React from 'react';
import { Field, reduxForm } from 'redux-form';

export class UsernameInput extends React.Component {
    render() {
        const me = this;
        return (
            <Field
                component="input"
                type="text"
                name="username"
                placeholder="vaše jméno"
            />
        );
    }
};

UsernameInput = reduxForm({
    form: 'username',
    initialValues: { username: localStorage.getItem('username') },
    onChange: values => localStorage.setItem('username',values.username),
})(UsernameInput);

export default UsernameInput;
