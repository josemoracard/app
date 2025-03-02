import PropTypes from 'prop-types';
import {
  Box,
  useColorModeValue,
  Button,
  Flex,
  Progress,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { formatDuration, intervalToDuration, subMinutes } from 'date-fns';
import { es, en } from 'date-fns/locale';
import { memo, useState } from 'react';
import Image from 'next/image';
import CustomTheme from '../../../styles/theme';
import Text from './Text';
import Icon from './Icon';
import { isNumber, isValidDate } from '../../utils';
import useStyle from '../hooks/useStyle';
import ProjectsSection from './ProjectsSection';
import ButtonHandler from '../../js_modules/profile/Subscriptions/ButtonHandler';
import UpgradeModal from '../../js_modules/profile/Subscriptions/UpgradeModal';

const availableLanguages = {
  es,
  en,
};

const ProgramCard = ({
  programName, programDescription, haveFreeTrial, startsIn, icon, iconBackground, stTranslation,
  syllabusContent, freeTrialExpireDate, courseProgress, lessonNumber, isLoading,
  width, assistants, teacher, handleChoose, isHiddenOnPrework, isAvailableAsSaas,
  subscriptionStatus, subscription, isMarketingCourse, iconLink,
}) => {
  const { t, lang } = useTranslation('program-card');
  const textColor = useColorModeValue('black', 'white');
  const [upgradeModalIsOpen, setUpgradeModalIsOpen] = useState(false);
  const [offerProps, setOfferProps] = useState({});
  const [subscriptionProps, setSubscriptionProps] = useState({});

  const freeTrialExpireDateValue = isValidDate(freeTrialExpireDate) ? new Date(freeTrialExpireDate) : new Date(subMinutes(new Date(), 1));
  const now = new Date();
  const { lightColor, hexColor } = useStyle();
  const isFreeTrial = isAvailableAsSaas && subscriptionStatus === 'FREE_TRIAL';
  const isCancelled = isAvailableAsSaas && (subscriptionStatus === 'CANCELLED' || subscriptionStatus === 'PAYMENT_ISSUE');
  const isExpired = isFreeTrial && freeTrialExpireDateValue < now;
  const statusActive = subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'FULLY_PAID';
  // const statusActive = subscriptionStatus === 'ACTIVE' || isFreeTrial || subscriptionStatus === 'FULLY_PAID';

  const programCardTR = stTranslation?.[lang]?.['program-card'];

  const statusTimeString = (start) => {
    if (start < now) return 'started';
    return 'idle';
  };
  const hasStarted = statusTimeString(new Date(startsIn)) === 'started';

  const formatTimeString = (start) => {
    const duration = intervalToDuration({
      end: now,
      start,
    });

    if (duration.days > 0) duration.hours = 0;

    const formated = formatDuration(duration,
      {
        format: ['months', 'weeks', 'days', 'hours'],
        delimiter: ', ',
        locale: availableLanguages[lang],
      });

    if (formated === '') return stTranslation ? stTranslation[lang]['program-card']['starting-today'] : t('starting-today');
    // if (start < now) return stTranslation ? stTranslation[lang]['program-card'].started : t('started');
    return formated;
  };

  const statusLabel = {
    active: programCardTR?.status?.active || t('status.active'),
    fully_paid: programCardTR?.status?.fully_paid || t('status.fully_paid'),
    expired: programCardTR?.expired || t('status.expired'),
    cancelled: programCardTR?.status?.cancelled || t('status.cancelled'),
    payment_issue: programCardTR?.status?.payment_issue || t('status.payment_issue'),
  };

  const onOpenUpgrade = (data) => {
    setOfferProps(data);
    setUpgradeModalIsOpen(true);
  };

  const FreeTagCapsule = () => {
    let timeString = '';
    const duration = intervalToDuration({
      end: now,
      start: freeTrialExpireDateValue,
    });
    const hours = duration?.hours;
    const formated = formatDuration(duration,
      {
        format: ['days'],
        locale: availableLanguages[lang],
      });

    if (isExpired) timeString = stTranslation ? stTranslation[lang]['program-card']['non-left'] : t('non-left');
    else if (duration.days > 0) timeString = `${formated} ${stTranslation ? stTranslation[lang]['program-card'].left : t('left')}`;
    else if (duration.days === 0 && hours >= 0) timeString = `${hours > 0 ? `${hours}h ${t('common:and')}` : ''} ${duration?.minutes}min`;
    else timeString = stTranslation ? stTranslation[lang]['program-card'].today : t('today');

    return (
      <Flex
        borderRadius="15px"
        background={isExpired ? '#FFE7E9' : CustomTheme.colors.yellow.light}
        padding="5px"
        height="21px"
        alignItems="center"
      >
        <Icon icon="free" width="29px" height="14px" style={{ marginRight: '5px' }} />
        <Text
          fontSize="xs"
          lineHeight="14px"
          fontWeight="400"
          color={isExpired ? '#EB5757' : '#01455E'}
        >
          {timeString}
        </Text>
      </Flex>
    );
  };

  return (
    <Box
      border="1px solid"
      borderColor="#DADADA"
      borderRadius="9px"
      width={width}
      padding="15px"
      position="relative"
      height="min-content"
    >
      {iconLink ? (
        <Box position="absolute" borderRadius="full" top="-30px" padding="10px">
          <Image src={iconLink} width="36px" height="36px" />
        </Box>
      ) : (
        <Box position="absolute" borderRadius="full" top="-30px" background={iconBackground} padding="10px">
          <Icon
            width="32px"
            height="32px"
            icon={icon}
          />
        </Box>
      )}

      {!isHiddenOnPrework && !isMarketingCourse && (
        <Flex height="30px" id="upper-left-section" flexDirection="row-reverse">
          {isLoading ? (
            <></>
          ) : (
            <>
              {isAvailableAsSaas && statusActive && subscriptionStatus !== 'FREE_TRIAL' ? (
                <>
                  {courseProgress === 0 ? (
                    <Flex width="116px" justifyContent="flex-end">
                      <Box marginRight="10px">
                        <Icon
                          width="14px"
                          height="21px"
                          icon="rocket"
                          color={hasStarted ? hexColor.blueDefault : ''}
                        />
                      </Box>
                      <Box>
                        <Text
                          fontSize="9px"
                          lineHeight="9.8px"
                          fontWeight="600"
                          color={textColor}
                        >
                          {hasStarted
                            ? `${stTranslation ? stTranslation[lang]['program-card']['started-in'] : t('started-in')}`
                            : `${stTranslation ? stTranslation[lang]['program-card']['starts-in'] : t('starts-in')}`}

                        </Text>
                        <Text
                          fontSize="9px"
                          lineHeight="9.8px"
                          fontWeight="400"
                          color={textColor}
                        >
                          {formatTimeString(new Date(startsIn))}
                        </Text>
                      </Box>
                    </Flex>

                  ) : (
                    <Icon icon="crown" width="22px" height="15px" />
                  )}
                </>
              ) : (
                <>
                  {isAvailableAsSaas && isFreeTrial ? (
                    <>
                      {hasStarted ? (
                        <FreeTagCapsule />
                      ) : (
                        <Flex width="116px" justifyContent="flex-end">
                          <Box marginRight="10px">
                            <Icon
                              width="14px"
                              height="21px"
                              icon="rocket"
                              color={hasStarted ? hexColor.blueDefault : ''}
                            />
                          </Box>
                          <Box>
                            <Text
                              fontSize="9px"
                              lineHeight="9.8px"
                              fontWeight="600"
                              color={textColor}
                            >
                              {hasStarted
                                ? `${stTranslation ? stTranslation[lang]['program-card']['started-in'] : t('started-in')}`
                                : `${stTranslation ? stTranslation[lang]['program-card']['starts-in'] : t('starts-in')}`}

                            </Text>
                            <Text
                              fontSize="9px"
                              lineHeight="9.8px"
                              fontWeight="400"
                              color={textColor}
                            >
                              {formatTimeString(new Date(startsIn))}
                            </Text>
                          </Box>
                        </Flex>
                      )}
                    </>
                  ) : (
                    <>
                      {(!isCancelled || isAvailableAsSaas === false) ? (
                        <Icon icon="crown" width="22px" height="15px" />
                      ) : (
                        <Box fontSize="12px" display="flex" alignItems="center" background="red.light" color="danger" height="22px" borderRadius="20px" padding="0 10px">
                          {statusLabel[subscriptionStatus.toLowerCase()]}
                        </Box>
                      )}
                      {/* {!isAvailableAsSaas && (
                      )} */}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </Flex>
      )}
      <Text
        fontSize="md"
        lineHeight="19px"
        fontWeight="700"
        color={textColor}
        marginBottom="10px"
        marginTop={(isHiddenOnPrework || isMarketingCourse) && '30px'}
      >
        {programName}
        {' '}
      </Text>

      {!isHiddenOnPrework && !isMarketingCourse ? (
        <>
          {isLoading ? (
            <>
              <Text
                fontSize="xs"
                lineHeight="14px"
                fontWeight="500"
                color={textColor}
              >
                {programDescription}
                {' '}
              </Text>
              <Button variant="outline" marginTop="20px" color="blue.default" borderColor="currentcolor" w="full" fontSize="12px" letterSpacing="0.05em">
                Loading...
              </Button>
            </>
          ) : (
            <>
              {((!hasStarted && courseProgress === 0) && statusActive) || ((!hasStarted && courseProgress === 0) && isFreeTrial) ? (
                <Box>
                  <Text
                    fontSize="xs"
                    lineHeight="14px"
                    fontWeight="500"
                    color={textColor}
                  >
                    {programDescription}
                    {' '}
                  </Text>
                  <ProjectsSection
                    startsIn={startsIn}
                    stTranslation={stTranslation}
                    syllabusContent={syllabusContent}
                    courseProgress={courseProgress}
                    assistants={assistants}
                    teacher={teacher}
                    isAvailableAsSaas={isAvailableAsSaas}
                    subscriptionStatus={subscriptionStatus}
                  />
                  {isFreeTrial && isExpired ? (
                    <ButtonHandler
                      subscription={subscription}
                      onOpenUpgrade={onOpenUpgrade}
                      setSubscriptionProps={setSubscriptionProps}
                      onOpenCancelSubscription={() => {}}
                      // ------------------
                      marginTop={!isCancelled && '20px'}
                      borderRadius="3px"
                      width="100%"
                      padding="0"
                      whiteSpace="normal"
                      variant="default"
                      alignItems="center"
                      background="yellow.default"
                      color="white"
                    >
                      <Icon style={{ marginRight: '10px' }} width="12px" height="18px" icon="rocket" color="currentColor" />
                      {programCardTR?.upgrade || t('upgrade')}
                    </ButtonHandler>
                  ) : (
                    <Button
                      marginTop="20px"
                      borderRadius="3px"
                      width="100%"
                      padding="0"
                      whiteSpace="normal"
                      variant="default"
                      onClick={handleChoose}
                    >
                      {programCardTR?.['start-course'] || t('start-course')}
                    </Button>
                  )}
                  {haveFreeTrial && (
                    <Button
                      marginTop="15px"
                      borderRadius="3px"
                      width="100%"
                      padding="0"
                      whiteSpace="normal"
                      variant="outline"
                      borderColor="blue.default"
                      color="blue.default"
                    >
                      {programCardTR?.['free-trial'] || t('free-trial')}
                    </Button>
                  )}
                </Box>
              ) : (
                <Box marginTop={courseProgress > 0}>
                  {courseProgress <= 0 && (
                    <Text
                      fontSize="xs"
                      lineHeight="14px"
                      fontWeight="500"
                      color={textColor}
                    >
                      {programDescription}
                      {' '}
                    </Text>
                  )}
                  <Box margin="auto" width="90%">
                    {courseProgress > 0 && (
                      <Box margin="20px 0 0 0">
                        <Progress value={courseProgress} colorScheme="blueDefaultScheme" height="10px" borderRadius="20px" />
                        <Text
                          fontSize="8px"
                          lineHeight="9.8px"
                          fontWeight="500"
                          marginTop="5px"
                          color={CustomTheme.colors.blue.default2}
                        >
                          {`${courseProgress}%`}
                        </Text>
                      </Box>
                    )}
                  </Box>
                  <ProjectsSection
                    startsIn={startsIn}
                    stTranslation={stTranslation}
                    syllabusContent={syllabusContent}
                    courseProgress={courseProgress}
                    assistants={assistants}
                    teacher={teacher}
                    isAvailableAsSaas={isAvailableAsSaas}
                    subscriptionStatus={subscriptionStatus}
                  />
                  <Text
                    marginTop="20px"
                    color={CustomTheme.colors.blue.default}
                    textAlign="center"
                    fontSize="xs"
                    lineHeight="14px"
                    fontWeight="700"
                  >
                    {!isExpired && (
                      <>
                        {(courseProgress > 0 && !isCancelled) ? (
                          <Button variant="link" onClick={handleChoose} gridGap="6px" fontWeight={700}>
                            {isNumber(String(lessonNumber))
                              ? `${programCardTR?.continue || t('continue')} ${lessonNumber} →`
                              : `${programCardTR?.['continue-course'] || t('continue-course')} →`}
                          </Button>

                        ) : (
                          <>
                            {(!isAvailableAsSaas || !isCancelled) && (
                            <Button
                              borderRadius="3px"
                              width="100%"
                              padding="0"
                              whiteSpace="normal"
                              variant="default"
                              mb={isAvailableAsSaas && !statusActive && '10px'}
                              onClick={handleChoose}
                            >
                              {programCardTR?.['start-course'] || t('start-course')}
                            </Button>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </Text>

                  {((isAvailableAsSaas && isFreeTrial) || (isAvailableAsSaas && !statusActive)) && (
                    <ButtonHandler
                      subscription={subscription}
                      onOpenUpgrade={onOpenUpgrade}
                      setSubscriptionProps={setSubscriptionProps}
                      onOpenCancelSubscription={() => {}}
                      // ------------------
                      marginTop={!isCancelled && !isExpired && courseProgress > 0 && '5px'}
                      borderRadius="3px"
                      width="100%"
                      padding="0"
                      whiteSpace="normal"
                      variant="default"
                      alignItems="center"
                      background="yellow.default"
                      color="white"
                    >
                      <Icon style={{ marginRight: '10px' }} width="12px" height="18px" icon="rocket" color="currentColor" />
                      {programCardTR?.upgrade || t('upgrade')}
                    </ButtonHandler>
                  )}
                </Box>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {isMarketingCourse ? (
            <>
              <Box width="100%" display="flex" justifyContent="center">
                <Text
                  size="12px"
                  color={lightColor}
                >
                  {programDescription}
                </Text>
              </Box>
              <Button
                borderRadius="3px"
                width="100%"
                padding="0"
                whiteSpace="normal"
                variant="default"
                mt="20px"
                onClick={handleChoose}
              >
                {t('enroll-now')}
              </Button>
            </>
          ) : (
            <Box width="100%" display="flex" justifyContent="center">
              <Text
                size="12px"
                color={lightColor}
              >
                {programCardTR?.['prework-message'] || t('prework-message')}
              </Text>
            </Box>
          )}
        </>

      )}

      <UpgradeModal
        upgradeModalIsOpen={upgradeModalIsOpen}
        setUpgradeModalIsOpen={setUpgradeModalIsOpen}
        subscriptionProps={subscriptionProps}
        offerProps={offerProps}
      />
    </Box>
  );
};

ProgramCard.propTypes = {
  programName: PropTypes.string.isRequired,
  programDescription: PropTypes.string,
  startsIn: PropTypes.instanceOf(Date),
  freeTrialExpireDate: PropTypes.instanceOf(Date),
  haveFreeTrial: PropTypes.bool,
  icon: PropTypes.string.isRequired,
  syllabusContent: PropTypes.objectOf(PropTypes.any),
  courseProgress: PropTypes.number,
  stTranslation: PropTypes.objectOf(PropTypes.any),
  lessonNumber: PropTypes.number,
  isLoading: PropTypes.bool,
  width: PropTypes.string,
  assistants: PropTypes.arrayOf(PropTypes.any),
  teacher: PropTypes.objectOf(PropTypes.any),
  iconBackground: PropTypes.string,
  handleChoose: PropTypes.func,
  isHiddenOnPrework: PropTypes.bool,
  isMarketingCourse: PropTypes.bool,
  iconLink: PropTypes.string,
  // onOpenModal: PropTypes.func,
  isAvailableAsSaas: PropTypes.bool,
  subscriptionStatus: PropTypes.string,
  subscription: PropTypes.objectOf(PropTypes.any),
};

ProgramCard.defaultProps = {
  stTranslation: null,
  programDescription: null,
  startsIn: null,
  haveFreeTrial: false,
  syllabusContent: null,
  courseProgress: null,
  freeTrialExpireDate: null,
  lessonNumber: null,
  isLoading: false,
  width: '292px',
  assistants: [],
  teacher: null,
  iconBackground: '',
  handleChoose: () => {},
  isHiddenOnPrework: false,
  isMarketingCourse: false,
  iconLink: '',
  isAvailableAsSaas: false,
  subscriptionStatus: '',
  subscription: {},
};

export default memo(ProgramCard);
