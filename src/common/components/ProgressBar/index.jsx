import {
  Box, Flex, Heading,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import handlers from '../../handlers';
import useStyle from '../../hooks/useStyle';
import Icon from '../Icon';
import Counter from '../ProgressCircle/Counter';
import Text from '../Text';
import Progress from './Progress';

const ProgressBar = ({
  progressText, taskTodo, width,
}) => {
  const { fontColor } = useStyle();

  const { allTasks, percentage } = handlers.handleTasks(taskTodo);
  return (
    <Box width={width || '100%'}>
      <Flex marginBottom="15px" gridGap="10px" align="center">
        <Heading fontSize="22px" marginY="0">
          <Counter valueTo={percentage} totalDuration={2} />
          %
        </Heading>
        <Text size="l" marginY="0">
          {progressText}
        </Text>
      </Flex>
      <Progress percents={percentage} />
      <Flex justifyContent="space-around" marginTop="18px" flexWrap="wrap" gridGap="6px">
        {allTasks.map((program) => (
          <Box key={program.title} display="flex">
            <Icon
              icon={program.icon || 'book'}
              width="18px"
              height="18px"
              color={fontColor}
              style={{ marginTop: '2px' }}
            />
            <Text marginLeft="11px" size="l" marginY="0">
              {`${program.title}: ${program.completed}/${program.taskLength}`}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

ProgressBar.propTypes = {
  width: PropTypes.string,
  progressText: PropTypes.string,
  taskTodo: PropTypes.arrayOf(PropTypes.object),
};
ProgressBar.defaultProps = {
  width: '100%',
  progressText: 'progress in the program',
  taskTodo: [],
};

export default ProgressBar;
