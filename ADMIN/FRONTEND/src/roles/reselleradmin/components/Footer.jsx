import React from 'react'

function Footer() {
  const year = new Date();
  return (
    // <!-- Main Footer -->
      <footer className="footer">
        <div className="d-sm-flex justify-content-center justify-content-sm-between">
          <span className="text-muted text-center text-sm-left d-block d-sm-inline-block"><strong>Copyright &copy; {year.getFullYear()} <a href="https://www.outdidtech.com/" target="_blank" rel="noopener noreferrer">EV Power</a>.</strong> All rights reserved.</span>
        </div>
      </footer> 
  );
};
export default Footer
