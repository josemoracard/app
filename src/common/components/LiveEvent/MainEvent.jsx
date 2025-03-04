import { useEffect, useState } from 'react';
import { Box, Divider, Tag, TagLabel, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Text from '../Text';
import bc from '../../services/breathecode';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';
import CustomTheme from '../../../../styles/theme';
import { getStorageItem, lengthOfString, syncInterval } from '../../../utils';

const MainEvent = ({
  index, event, mainEvents, getOtherEvents, isLiveOrStarting, getLiveIcon, host, nearestEvent,
  isLive, stTranslation, mainClasses, textTime, subLabel, isWorkshop,
}) => {
  const [time, setTime] = useState('');
  const { t, lang } = useTranslation('live-event');
  const limit = 40;
  const eventTitle = event?.cohort_name || event?.title;
  const titleLength = lengthOfString(eventTitle);
  const truncatedText = titleLength > limit ? `${eventTitle?.substring(0, limit)}...` : eventTitle;

  const truncatedTime = lengthOfString(time) >= 16 ? `${time?.substring(0, 15)}...` : time;
  const toast = useToast();
  const { fontColor, disabledColor, backgroundColor2, hexColor } = useStyle();

  const accessToken = getStorageItem('accessToken');
  const liveStartsAtDate = new Date(event?.starting_at);
  const liveEndsAtDate = new Date(event?.ending_at);

  useEffect(() => {
    setTime(textTime(liveStartsAtDate, liveEndsAtDate));

    syncInterval(() => {
      setTime(textTime(liveStartsAtDate, liveEndsAtDate));
    });
    // const interval = setInterval(() => {
    //   setTime(textTime(liveStartsAtDate, liveEndsAtDate));
    // }, 60000);
    // return () => {
    //   clearInterval(interval);
    // };
  }, []);

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        cursor={(!event?.hash || isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) && 'pointer'}
        onClick={() => {
          if (event?.hash && isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) {
            bc.events().joinLiveClass(event.hash)
              .then((resp) => {
                if (resp.data?.url) {
                  window.open(resp.data?.url);
                } else {
                  toast({
                    title: t('alert-message:no-link-exist'),
                    status: 'info',
                    duration: 4000,
                    isClosable: true,
                  });
                }
              })
              .catch(() => {
                toast({
                  title: t('alert-message:something-went-wrong'),
                  status: 'error',
                  duration: 3000,
                  isClosable: true,
                });
              });
          }
          if (!event?.hash) {
            window.open(`${host}/v1/events/me/event/${nearestEvent?.id}/join?token=${accessToken}`);
          }
        }}
      >
        <Box
          borderRadius="full"
          width="50px"
          height="50px"
          className={
            isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)
              ? `${mainClasses.length === 0 ? 'pulse-blue' : 'pulse-red'}`
              : ''
          }
          opacity={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) ? '1' : '0.5'}
          position="relative"
        >
          {mainEvents.length <= 1 && getOtherEvents().filter((e) => isLiveOrStarting(new Date(e?.starting_at), new Date(e?.ending_at)))?.length !== 0 && (
            <Box
              borderRadius="full"
              width="17px"
              height="17px"
              position="absolute"
              color="white"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              left="75%"
            >
              <Box borderRadius="full" background="none" className="pulse-red" width="16px" height="16px" display="inline-block" marginRight="5px">
                <Icon width="16px" height="16px" icon="on-live" />
              </Box>
            </Box>
          )}
          <Icon
            width="50px"
            height="50px"
            icon={getLiveIcon(event)}
          />
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          flexDirection="column"
          marginLeft="10px"
          width="100%"
        >
          <Text
            size="15px"
            lineHeight="18px"
            fontWeight="900"
            color={fontColor}
            opacity={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) ? 1 : 0.5}
            marginBottom="5px"
            marginTop="0"
            title={eventTitle}
          >
            {(truncatedText && eventTitle) ? (
              <>
                {truncatedText}
              </>
            ) : (
              <>
                {stTranslation ? stTranslation[lang]['live-event']['live-class'] : t('live-class')}
              </>
            )}
          </Text>
          <Box display="flex" justifyContent="space-between">
            {(event?.subLabel || event?.type || subLabel) && (
              <Tag
                size="sm"
                borderRadius="full"
                variant="solid"
                colorScheme="green"
                width="fit-content"
                background={isWorkshop ? 'green.light' : backgroundColor2}
              >
                <TagLabel
                  fontWeight="700"
                  color={isWorkshop ? 'success' : hexColor.blueDefault}
                  opacity={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) ? 1 : 0.5}
                >
                  {event?.subLabel || event?.type || subLabel}
                </TagLabel>
              </Tag>
            )}
            {isLive(liveStartsAtDate, liveEndsAtDate) ? (
              <Tag
                size="sm"
                borderRadius="full"
                variant="solid"
                colorScheme="green"
                width="fit-content"
                background={CustomTheme.colors.red.light}
              >
                <TagLabel
                  fontWeight="700"
                  color={CustomTheme.colors.danger}
                >
                  {stTranslation ? `• ${stTranslation[lang]['live-event']['live-now']}` : `• ${t('live-now')}`}
                </TagLabel>
              </Tag>
            ) : (
              <Text
                fontSize="13px"
                lineHeight="18px"
                fontWeight={500}
                color={disabledColor}
                marginBottom="0"
                marginTop="0"
                title={time}
              >
                {truncatedTime}
              </Text>
            )}
          </Box>
        </Box>
      </Box>
      {index !== mainEvents.length - 1 && <Divider margin="10px 0" />}
    </>
  );
};

MainEvent.propTypes = {
  index: PropTypes.number.isRequired,
  event: PropTypes.objectOf(PropTypes.any).isRequired,
  mainEvents: PropTypes.arrayOf(PropTypes.any).isRequired,
  getOtherEvents: PropTypes.func.isRequired,
  isLiveOrStarting: PropTypes.func.isRequired,
  getLiveIcon: PropTypes.func.isRequired,
  host: PropTypes.string.isRequired,
  nearestEvent: PropTypes.objectOf(PropTypes.any).isRequired,
  isLive: PropTypes.func.isRequired,
  textTime: PropTypes.func.isRequired,
  stTranslation: PropTypes.objectOf(PropTypes.any).isRequired,
  mainClasses: PropTypes.arrayOf(PropTypes.any).isRequired,
  subLabel: PropTypes.string,
  isWorkshop: PropTypes.bool,
};
MainEvent.defaultProps = {
  subLabel: '',
  isWorkshop: false,
};

export default MainEvent;
