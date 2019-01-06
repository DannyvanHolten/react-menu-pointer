import * as api from './index';

describe('Index', () => {
  it('should contain the withMenuPointer', () => {
    expect(api).toMatchSnapshot();
  });
});
