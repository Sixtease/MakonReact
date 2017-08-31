import React from 'react';
import { IndexLink, Link } from 'lib/react-router';
import './Header.scss';
import UsernameInput from 'components/UsernameInput/index.js';

export class Header extends React.Component {
    render() {
        return (
            <div className='row'>
                <div className='col-xs-12'>
                    <nav className='navbar navbar-default'>
                        <ul className='nav navbar-nav'>
                            <li>
                                <IndexLink to='/' activeClassName='route--active'>
                                    audio.Makoň
                                </IndexLink>
                            </li>
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
                        <div className='navbar-form navbar-left'>
                            <div className='form-group'>
                                <UsernameInput />
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        );
    }
};

export default Header;
