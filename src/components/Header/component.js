import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.scss';
import UsernameInput from '../UsernameInput/index.js';

export class Header extends React.Component {
  render() {
    const me = this;
    return (
      <div className="row">
        <div className="col-xs-12">
          <nav className="navbar navbar-default">
            <ul className="nav navbar-nav">
              <li>
                <NavLink to="/" activeClassName="route--active">
                  rádio Makoň
                </NavLink>
              </li>
              <li>
                <NavLink to="/o-projektu/" activeClassName="route--active">
                  o projektu
                </NavLink>
              </li>
            </ul>
            <form
              className="navbar-form navbar-left"
              action="/vyhledavani/"
              method="get"
            >
              <div className="form-group">
                <input
                  type="text"
                  className="form-control js-search-input"
                  placeholder="dotaz"
                  name="dotaz"
                  ref={el => {
                    if (el) {
                      el.value = new URLSearchParams(me.props.location.search).get('dotaz') || '';
                    }
                  }}
                />
              </div>
              <button type="submit" className="btn btn-default">
                hledat
              </button>
            </form>
            <div className="navbar-form navbar-left">
              <div className="form-group">
                <UsernameInput />
              </div>
            </div>
          </nav>
        </div>
      </div>
    );
  }
}

export default Header;
