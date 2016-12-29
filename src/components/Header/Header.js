import React from 'react';
import { IndexLink, Link } from 'react-router';
import './Header.scss';

export const Header = () => (
    <div className='row'>
        <div className='col-xs-12'>
            <nav className='navbar navbar-default'>
                <div className='navbar-header'>
                    <IndexLink to='/' activeClassName='route--active'>
            audio.Makoň
          </IndexLink>
                </div>
                <ul className='nav navbar-nav'>
                    <li>
                        <Link to='/o-projektu/' activeClassName='route--active'>
              o projektu
            </Link>
                    </li>
                </ul>
                <form className='navbar-form navbar-left' action='/vyhledavani/' method='get'>
                    <div className='form-group'>
                        <input
                          type='text'
                          className='form-control js-search-input'
                          placeholder='dotaz'
                          name='dotaz'
            />
                    </div>
                    <button type='submit' className='btn btn-default'>hledat</button>
                </form>
            </nav>
        </div>
    </div>
);

export default Header;
