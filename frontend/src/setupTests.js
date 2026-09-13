import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'stream/web';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = ReadableStream;

jest.mock('react-calendar', () => {
  return function MockCalendar() {
    return <div data-testid="react-calendar" />;
  };
});

if (typeof window !== 'undefined') {
  window.scrollTo = jest.fn();
}
