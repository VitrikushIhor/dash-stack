import { parseSessionUserAgent } from '../../../presentation/validators/session-user-agent.validator';

describe('parseSessionUserAgent', () => {
  it('should_accept_bounded_browser_header', () => {
    expect(parseSessionUserAgent(' Browser test agent ')).toBe('Browser test agent');
  });
  it.each([undefined, [], '', 'a'.repeat(513), 'agent\r\nheader'])(
    'should_reject_invalid_metadata_%s',
    (input) => {
      expect(parseSessionUserAgent(input)).toBeUndefined();
    },
  );
});
