import React, { useState } from 'react';
import { BrowserRouter, Link, NavLink, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import useFetch from 'react-fetch-hook';
import { render } from 'react-dom';
import parser from 'html-react-parser';
import { FaHome } from 'react-icons/fa';
import { AiFillAlert, AiFillProfile } from 'react-icons/ai';
import './styles.scss';

const Error = ({ error }) => <div><p>Error:</p> {error}</div>

const Loading = () =>
  <div className='pure-g'>
    <div className='pure-u-1 centered'>
      <h3>Loading...</h3>
    </div>
  </div>

const PropertyDetail = ({
  data
}) => {

  const params = useParams();

  if (!params.property_id || !data.result)
    return <div>Loading...</div>

  const {
    display_address,
    available_on,
    contact_telephone,
    town,
    price,
    pppw_price,
    property_type,
    short_description,
    furnishing,
    photos,
    features
  } = data.result.properties.elements.find(x => `${x.property_id}` === params.property_id);

  return <div className='pure-g propertyInfo'>
    <div className='pure-u-1'>
      <h3>Property Info</h3>
      <p>{display_address}</p>
      <p>{available_on}</p>
      <p>{contact_telephone}</p>
      <p>{town}</p>
      <p>{price}</p>
      <p>{pppw_price}</p>
      <p>{property_type}</p>
      <p>Description:</p>
      <p>{parser(short_description)}</p>
      <p>Furnishing:</p>
      <ul>
        {furnishing && furnishing.map((t, i) => <li key={`furnishing-${i}`}>{t}</li>)}
      </ul>
      <p>Images:</p>
      <ul className='pure-g'>
        {photos && photos.map((img, i) => {
          return <li className='l-box pure-u-1-3' key={`image-${i}`}><img src={'http://mr0.homeflow.co.uk/' + img} /></li>
        })}
      </ul>
      <p>Features:</p>
      <ul>
        {features && features.map((t, i) => <li key={`feature-${i}`}>{t}</li>)}
      </ul>
    </div>
  </div>
}

const PropertyMin = ({
  property_id,
  town,
  photos
}) => {
  return <div className='property-item'>
    <div className='image'>
      {photos && photos.length ? <img src={'http://mr0.homeflow.co.uk/' + photos[0]} /> : <img src='https://via.placeholder.com/256' />}
    </div>
    {parser(town)}
    <NavLink
      style={{ display: "block", margin: "1rem 0" }}
      to={`/properties/${property_id}`}
      key={property_id}
    >
      View Details
    </NavLink>
  </div>
}

const Properties = ({ properties = [], isMinimal = false }) => {
  return <div className='pure-g properties'>
    {properties.map(data => {
      const { property_id } = data;
      return <div className='l-box pure-u-1-3' key={property_id}>
        <PropertyMin {...data} />
      </div>
    })}
  </div>
}

const Listing = ({ data, isMinimal = false, query = '' }) => {
  const filteredData = data.result.properties.elements.filter((item) => {
    if (query.length === 0) {
      return item;
    } else {
      return item.town.toLowerCase().includes(query) ||
        item.tags.some(x => x.toLowerCase().includes(query));
    }
  });

  return <Properties isMinimal={isMinimal} properties={filteredData} />;
}

const Header = ({
  setInputText = () => { }
}) => {

  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  let inputHandler = (e) => {
    var lowerCase = e.target.value.toLowerCase();
    setInputText(lowerCase);
    navigate('/');
  };

  const onShowNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
  }

  const onShowProfile = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
  }

  return <div className='home-menu pure-menu pure-menu-horizontal pure-menu-fixed'>
    <header className='pure-g header'>
      <ul className='pure-u-2-24 pure-menu-list'>
        <li className='pure-menu-item'>
          <Link to='/'>
            <FaHome />
          </Link>
        </li>
      </ul>
      <form className="pure-form pure-u-19-24 searchbar">
        <input onChange={inputHandler} placeholder='Search' className='pure-input-rounded' />
      </form>
      <div className="pure-u-3-24">
        <div className="notifications pure-u-1-2">
          <AiFillAlert onClick={onShowNotifications} />
          <dl className={`absolute notification-items ${showNotifications ? '' : 'hidden'}`} aria-hidden="true">
            <dd>
              <span>New property added!</span>
            </dd>
          </dl>
        </div>
        <div className='profile pure-u-1-2'>
          <AiFillProfile onClick={onShowProfile} />
          <ul className={`absolute dropdownMenu ${showProfile ? '' : 'hidden'}`} aria-hidden="true">
            <li><a href="#">Settings</a></li>
            <li><a href="#">Sign Out</a></li>
          </ul>
        </div>
      </div>
    </header>
  </div>
}

const App = () => {
  const { isLoading, error, data } = useFetch('/api/properties?location=brighton');
  const [inputText, setInputText] = useState("");

  if (isLoading)
    return <Loading />

  if (error)
    return <Error error={error} />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div>
            <Header setInputText={setInputText} />
            <Listing data={data} isMinimal={true} query={inputText} />
          </div>
        } />
        <Route path="properties">
          <Route path=":property_id" element={
            <div>
              <Header setInputText={setInputText} />
              <PropertyDetail data={data} />
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

render(<App />, document.querySelector('#app'));