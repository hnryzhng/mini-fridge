import React, { Component } from 'react';

import './Footer.css';

class Footer extends Component {
	render() {
		return(
			<div id="footer-container">
				<a href="http://henryzheng.me" id="footer-brand-link">
					<div id="footer-logo">
						<p className="footer-brand-text" id="footer-brand-top-text">made by</p>					
						<p className="footer-brand-text" id="footer-brand-bottom-text">hz</p>
					</div>
				</a>
			</div>
		)
	}
}

export default Footer;