import React from 'react';
import { addMinutes, subMinutes } from 'date-fns';
import LiveEvent from '../common/components/LiveEvent';

export default {
  title: 'Components/LiveEvent',
  component: LiveEvent,
  argTypes: {
    startsAt: {
      control: {
        type: 'date'
      }
    },
    otherEvents: {
      control: {
        type: 'object'
      }
    }
  }
};

const Component = (args) => (
  <LiveEvent {...args} />
);
export const Default = Component.bind({});
Default.args = {
  startsAt: subMinutes(new Date(), 40),
  // otherEvents: [{
  //   title: 'My Wonderful HTML Email Workflow',
  //   starts_at: subMinutes(new Date(), 40),
  //   icon: 'group',
  //   fill: CustomTheme.colors.success,
  // }, {
  //   title: 'Coding Jamming',
  //   starts_at: addMinutes(new Date(), 15),
  //   icon: 'codeBg',
  // }],
};