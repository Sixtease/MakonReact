import React from 'react';
import { get_username, set_username } from '../../lib/username';

export class UsernameInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: get_username(),
    };
  }

  onChange = evt => {
    const username = evt.target.value;
    this.setState({ username });
    set_username(username);
  };

  render() {
    return (
      <input
        type="text"
        name="username"
        value={this.state.username}
        onChange={this.onChange}
        placeholder="vaše jméno"
      />
    );
  }
}

export default UsernameInput;
