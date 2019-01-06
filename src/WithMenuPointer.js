import React, { Component } from 'react';
import pt from 'prop-types';

const withMenuPointer = (WrappedComponent, config = {}) => {
  class WithMenuPointer extends Component {
    delayTimer = null; // the actual time to delay.

    lastDelayedLocation = null; // last mouse location when menu had a delay.

    mouseLocations = []; // array of mouse locations we need to save to track the movement.

    config = {
      delay: config.delay || 300, // default delay when moving the cursor.
      element: 'menu-pointer', // default DOM element to trigger on.
      locationsTracked: config.locationsTracked || 3, // number of locations to track.
      submenuDirection: config.submenuDirection || 'right', // the location where the submenu is in comparison to the main menu.
      tolerance: config.tolerance || 75, // how tolerable are we when a user scrolls outside of the menu.
    };

    componentDidMount() {
      // Add event listener when user enter the menu.
      window.addEventListener('mousemove', this.handleMouseMove);
    };

    componentWillUnmount() {
      // Reset all the variables when we unmount.
      window.removeEventListener('mousemove', this.handleMouseMove);
      this.mouseLocations = [];
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    };

    slope = (a, b) => (b.y - a.y) / (b.x - a.x); // Calculate our movement angle.

    getDelay = () => {
      const menu = document.getElementById(this.config.element);

      // If there is no menu element present, immediately activate.
      if (!menu) {
        return 0;
      }

      // Offset for the menu location.
      const menuOffset = {
        top: menu.getBoundingClientRect().top + document.body.scrollTop,
        left: menu.getBoundingClientRect().left + document.body.scrollLeft,
      };

      // Calculate styles for the menu.
      const menuStyle = getComputedStyle(menu);


      // Top left corner we want to start using menu pointer.
      const upperLeft = {
        x: menuOffset.left,
        y: menuOffset.top - this.config.tolerance,
      };

      // Top right corner we want to start using menu pointer.
      const upperRight = {
        x: menuOffset.left + menu.offsetWidth + (parseInt(menuStyle.marginLeft, 10) || 0),
        y: upperLeft.y,
      };

      // Bottom left corner we want to start using menu pointer.
      const lowerLeft = {
        x: menuOffset.left,
        y: menuOffset.top + menu.offsetHeight + (parseInt(menuStyle.marginTop, 10) || 0) + this.config.tolerance,
      };

      // Bottom right corner we want to start using menu pointer.
      const lowerRight = {
        x: upperRight.x,
        y: lowerLeft.y,
      };

      const loc = this.mouseLocations[this.mouseLocations.length - 1]; // Our current location
      let prevLoc = this.mouseLocations[0]; // Our previous location

      // When if we have no current location, immediately activate. this happens when the user enters the menu for the first time.
      if (!loc) {
        return 0;
      }

      // If there is no previous location make the current location the previous.
      if (!prevLoc) {
        prevLoc = loc;
      }

      // If the previous mouse location was outside of the entire menu's bounds, immediately activate.
      if (prevLoc.x < menuOffset.left || prevLoc.x > lowerRight.x || prevLoc.y < menuOffset.top || prevLoc.y > lowerRight.y) {
        return 0;
      }

      // If the mouse hasn't moved since the last time we checked for activation status, immediately activate.
      if (this.lastDelayedLocation && loc.x === this.lastDelayedLocation.x && loc.y === this.lastDelayedLocation.y) {
        return 0;
      }

      // Detect if the user is moving towards the currently activated submenu.
      //
      // If the mouse is heading relatively clearly towards the submenu's content, we should wait and give the user more time before
      // activating a new row. If the mouse is heading elsewhere, we can immediately activate a new row.
      //
      // We detect this by calculating the slope formed between the current mouse location and the upper/lower right points of the menu.
      // We do the same for the previous mouse location. If the current mouse location's slopes are increasing/decreasing appropriately
      // compared to the previous's, we know the user is moving toward the submenu.
      //
      // Note that since the y-axis increases as the cursor moves down the screen, we are looking for the slope between the cursor and the
      // upper right corner to decrease over time, not increase (somewhat counterintuitively).

      let decreasingCorner = upperRight;
      let increasingCorner = lowerRight;

      // Our expectations for decreasing or increasing slope values depends on which direction the submenu opens relative to the main menu.
      // By default, if the menu opens on the right, we expect the slope between the cursor and the upper right corner to decrease over
      // time, as explained above. If the submenu opens in a different direction, we change our slope expectations.
      if (this.config.submenuDirection === 'left') {
        decreasingCorner = lowerLeft;
        increasingCorner = upperLeft;
      }
      else if (this.config.submenuDirection === 'bottom') {
        decreasingCorner = lowerRight;
        increasingCorner = lowerLeft;
      }
      else if (this.config.submenuDirection === 'top') {
        decreasingCorner = upperLeft;
      }

      const decreasingSlope = this.slope(loc, decreasingCorner);
      const increasingSlope = this.slope(loc, increasingCorner);
      const prevDecreasingSlope = this.slope(prevLoc, decreasingCorner);
      const prevIncreasingSlope = this.slope(prevLoc, increasingCorner);

      // Mouse is moving from previous location towards the currently activated submenu. Delay before activating a new menu row,
      // because user may be moving into submenu.
      if (decreasingSlope < prevDecreasingSlope && increasingSlope > prevIncreasingSlope) {
        this.lastDelayedLocation = loc;
        return this.config.delay;
      }

      this.lastDelayedLocation = null;
      return 0;
    };

    handleMouseMove = (e) => {
      this.mouseLocations.push({
        x: e.pageX,
        y: e.pageY,
      });

      if (this.mouseLocations.length > this.config.locationsTracked) {
        this.mouseLocations.shift();
      }
    };

    handleMenuLeave = handler => {
      if (this.delayTimer) {
        clearTimeout(this.delayTimer);
      }

      if (typeof handler === 'function') {
        handler();
      }
    };

    handleRowEnter = handler => {
      if (this.delayTimer) {
        clearTimeout(this.delayTimer);
      }

      this.activateRow(handler);
    };

    activateRow = (handler) => {
      const delay = this.getDelay();

      if (delay) {
        this.delayTimer = setTimeout(() => this.activateRow(handler), delay);
      } else {
        handler();
      }
    };

    render() {
      return <WrappedComponent
        {...this.props}
        menuPointer={{
          handleMenuLeave: this.handleMenuLeave,
          handleRowEnter: this.handleRowEnter,
        }}
      />;
    }
  }

  WithMenuPointer.propTypes = {
    config: pt.shape({
      delay: pt.number,
      element: pt.string,
      locationsTracked: pt.number,
      submenuDirection: pt.oneOf(['top', 'right', 'bottom', 'left']),
      tolerance: pt.number,
    }),
  };

  WithMenuPointer.defaultProps = {
    config: {},
  };

  return WithMenuPointer;
};

export default withMenuPointer;
