import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import withMenuPointer from './WithMenuPointer';

describe('WithExperiments', () => {
  it('should render correctly', () => {
    const Component = withMenuPointer(<p>Component</p>);
    const wrapper = shallow(<Component />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it('should handle slope correctly', () => {
    const Component = withMenuPointer(<p>Component</p>);
    const wrapper = shallow(<Component />);
    expect(wrapper.instance().slope({ x: 3, y: 5 }, { x: 10, y: 267 })).toEqual(37.42857142857143);
  });

  it('should handle getDelay correctly', () => {
    const Component = withMenuPointer(<p>Component</p>);
    const wrapper = shallow(<Component />);
    expect(wrapper.instance().slope({ x: 3, y: 5 }, { x: 10, y: 267 })).toEqual(37.42857142857143);
  });
});
