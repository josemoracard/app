import { useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import useStyle from '../../../common/hooks/useStyle';
import bc from '../../../common/services/breathecode';
import { toCapitalize, unSlugify } from '../../../utils';

const profileHandlers = ({
  translations,
}) => {
  const { t } = useTranslation('profile');
  const { reverseFontColor, fontColor, lightColor } = useStyle();
  const subscriptionTR = translations?.subscription;
  const toast = useToast();
  const router = useRouter();

  const getPlanProps = async (slug) => {
    const resp = await bc.payment().getPlanProps(encodeURIComponent(slug));
    const data = await resp?.data;
    return data;
  };

  const statusLabel = {
    free_trial: subscriptionTR?.status?.free_trial || t('subscription.status.free_trial'),
    fully_paid: subscriptionTR?.status?.fully_paid || t('subscription.status.fully_paid'),
    active: subscriptionTR?.status?.active || t('subscription.status.active'),
    expired: subscriptionTR?.status?.expired || t('subscription.status.expired'),
    payment_issue: subscriptionTR?.status?.payment_issue || t('subscription.status.payment_issue'),
    cancelled: subscriptionTR?.status?.cancelled || t('subscription.status.cancelled'),
    completed: subscriptionTR?.status?.completed || t('subscription.status.completed'),
  };
  const statusStyles = {
    free_trial: {
      color: fontColor,
      border: '1px solid',
      borderColor: lightColor,
    },
    fully_paid: {
      color: 'green.400',
      background: 'green.light',
    },
    active: {
      color: 'green.400',
      background: 'green.light',
    },
    expired: {
      color: fontColor,
      background: 'transparent',
      border: '1px solid',
    },
    payment_issue: {
      color: 'danger',
      background: 'red.light',
    },
    cancelled: {
      color: reverseFontColor,
      background: 'gray.default',
    },
    completed: {
      color: 'blue.default',
      border: '1px solid',
      borderColor: 'blue.default',
    },
  };

  return {
    statusStyles,
    statusLabel,
    getLocaleDate: (date) => {
      const newDate = new Date(date);
      return newDate.toLocaleDateString();
    },
    durationFormated: (format) => {
      const duration = format?.duration;
      const days = duration?.days;
      const hours = duration?.hours;
      const daysLabel = translations?.days || t('days');
      const dayLabel = translations?.day || t('day');
      const monthsLabel = translations?.months || t('months');
      const monthLabel = translations?.month || t('month');
      const andLabel = translations?.and || t('and');
      const hoursLabel = translations?.hours || t('hours');

      if (format.status === 'expired') return translations?.expired || t('expired');
      if (duration?.months > 0) return `${duration?.months} ${duration?.months <= 1 ? monthLabel : monthsLabel}`;
      if (days === 0 && hours > 0) return `${hours}h ${andLabel} ${duration?.minutes}min`;
      if (days > 7) return `${days} ${daysLabel}`;
      if (days <= 7 && hours < 0) return `${days} ${days > 1 ? daysLabel : dayLabel} ${duration?.hours > 0 ? `${andLabel} ${duration?.hours} ${hoursLabel}` : ''}`;
      return format?.formated;
    },
    payUnitString: (payUnit) => {
      if (payUnit === 'MONTH') return translations?.monthly || t('monthly');
      if (payUnit === 'HALF') return translations?.['half-year'] || t('half-year');
      if (payUnit === 'QUARTER') return translations?.quaterly || t('quarterly');
      if (payUnit === 'YEAR') return translations?.yearly || t('yearly');
      return payUnit;
    },
    getPlanOffer: ({ slug, onOpenUpgrade = () => {} }) => new Promise((resolve, reject) => {
      bc.payment({
        original_plan: slug,
      }).planOffer()
        .then(async (res) => {
          const data = res?.data;
          const currentOffer = data.find((item) => item?.original_plan?.slug === slug);
          // necesito saber si plan financing tiene un plan offer

          if (currentOffer && currentOffer?.suggested_plan?.slug) {
            const offerData = currentOffer?.suggested_plan;
            const bullets = await getPlanProps(offerData?.slug);
            const outOfConsumables = currentOffer?.original_plan?.service_items.some((item) => item?.how_many === 0);

            // -------------------------------------------------- PREPARING PRICES --------------------------------------------------
            const existsAmountPerHalf = offerData?.price_per_half > 0;
            const existsAmountPerMonth = offerData?.price_per_month > 0;
            const existsAmountPerQuarter = offerData?.price_per_quarter > 0;
            const existsAmountPerYear = offerData?.price_per_year > 0;

            const isNotTrial = existsAmountPerHalf || existsAmountPerMonth || existsAmountPerQuarter || existsAmountPerYear;
            const financingOptionsExists = offerData?.financing_options?.length > 0;
            const financingOptionsManyMonthsExists = financingOptionsExists && offerData?.financing_options?.some((l) => l?.monthly_price > 0 && l?.how_many_months > 1);
            const financingOptionsOnePaymentExists = financingOptionsExists && offerData?.financing_options?.some((l) => l?.monthly_price > 0 && l?.how_many_months === 1);

            const isTotallyFree = !isNotTrial && offerData?.trial_duration === 0 && !financingOptionsExists;

            const financingOptionsManyMonths = financingOptionsManyMonthsExists
              ? offerData?.financing_options
                .filter((l) => l?.monthly_price > 0 && l?.how_many_months > 1)
                .sort((a, b) => a?.monthly_price - b?.monthly_price)
              : [];

            const financingOptionsOnePayment = financingOptionsOnePaymentExists
              ? offerData?.financing_options
                .filter((l) => l?.monthly_price > 0 && l?.how_many_months === 1)
                .sort((a, b) => a?.monthly_price - b?.monthly_price)
              : [];

            const getTrialLabel = () => {
              if (isTotallyFree) {
                return {
                  priceText: t('subscription.upgrade-modal.free-course'),
                  description: t('subscription.upgrade-modal.full_access'),
                };
              }
              if (offerData?.trial_duration_unit === 'DAY') {
                return {
                  priceText: `${t('subscription.upgrade-modal.duration_days', { duration: offerData?.trial_duration })} ${t('subscription.upgrade-modal.connector_duration_trial')}`,
                  description: `${t('subscription.upgrade-modal.no_card_needed')} ${t('subscription.upgrade-modal.duration_days', { duration: offerData?.trial_duration })}`,
                };
              }
              if (offerData?.trial_duration_unit === 'MONTH') {
                return {
                  priceText: `${offerData?.trial_duration} month trial`,
                  description: `${t('subscription.upgrade-modal.no_card_needed')} ${t('subscription.upgrade-modal.duration_month', { duration: offerData?.trial_duration })}`,
                };
              }
              return {
                priceText: t('subscription.upgrade-modal.free_trial'),
                description: '',
              };
            };

            const onePaymentFinancing = financingOptionsOnePaymentExists ? financingOptionsOnePayment.map((item) => ({
              title: t('subscription.upgrade-modal.monthly_payment'),
              price: item?.monthly_price,
              priceText: `$${item?.monthly_price}`,
              period: 'FINANCING',
              description: t('subscription.upgrade-modal.full_access'),
              how_many_months: item?.how_many_months,
              suggested_plan: offerData,
              type: 'PAYMENT',
              show: true,
            })) : [];

            const trialPlan = (!financingOptionsManyMonthsExists) ? {
              title: t('subscription.upgrade-modal.free_trial'),
              price: 0,
              priceText: getTrialLabel().priceText,
              trialDuration: offerData?.trial_duration,
              period: offerData?.trial_duration_unit,
              description: getTrialLabel().description,
              suggested_plan: offerData,
              type: isTotallyFree ? 'FREE' : 'TRIAL',
              isFree: true,
              show: true,
            } : {};

            const monthPlan = !financingOptionsOnePaymentExists && existsAmountPerMonth ? [{
              title: t('subscription.upgrade-modal.monthly_payment'),
              price: offerData?.price_per_month,
              priceText: `$${offerData?.price_per_month}`,
              period: 'MONTH',
              description: t('subscription.upgrade-modal.full_access'),
              suggested_plan: offerData,
              type: 'PAYMENT',
              show: true,
            }] : onePaymentFinancing;

            const yearPlan = existsAmountPerYear ? {
              title: t('subscription.upgrade-modal.yearly_payment'),
              price: offerData?.price_per_year,
              priceText: `$${offerData?.price_per_year}`,
              period: 'YEAR',
              description: t('subscription.upgrade-modal.full_access'),
              suggested_plan: offerData,
              type: 'PAYMENT',
              show: true,
            } : {};

            const financingOption = financingOptionsManyMonthsExists ? financingOptionsManyMonths.map((item) => ({
              title: t('subscription.upgrade-modal.many_months_payment', { qty: item?.how_many_months }),
              price: item?.monthly_price,
              priceText: `$${item?.monthly_price} x ${item?.how_many_months}`,
              period: 'FINANCING',
              description: t('subscription.upgrade-modal.many_months_description', { monthly_price: item?.monthly_price, many_months: item?.how_many_months }),
              how_many_months: item?.how_many_months,
              suggested_plan: offerData,
              type: 'PAYMENT',
              show: true,
            })) : [];

            const consumableOption = outOfConsumables && offerData?.service_items?.length > 0
              ? offerData?.service_items.map((item) => ({
                title: toCapitalize(unSlugify(String(item?.service?.slug))),
                price: item?.service?.price_per_unit,
                how_many: item?.how_many,
                suggested_plan: offerData,
                type: 'CONSUMABLE',
                show: true,
              }))
              : {};

            const paymentList = [...monthPlan, yearPlan, trialPlan].filter((plan) => Object.keys(plan).length > 0);
            const financingList = financingOption?.filter((plan) => Object.keys(plan).length > 0);
            const consumableList = [consumableOption].filter((plan) => Object.keys(plan).length > 0);

            const finalData = {
              title: toCapitalize(unSlugify(String(offerData?.slug))),
              slug: offerData?.slug,
              isTotallyFree,
              details: offerData?.details,
              expires_at: offerData?.expires_at,
              show_modal: currentOffer?.show_modal,
              pricing_exists: isNotTrial || financingOptionsExists,
              paymentOptions: paymentList,
              financingOptions: financingList,
              outOfConsumables,
              consumableOptions: consumableList,
              bullets,
            };
            // -------------------------------------------------- END PREPARING PRICES --------------------------------------------------
            resolve(finalData);
            if (currentOffer?.show_modal) {
              onOpenUpgrade(finalData);
            }

            if (currentOffer?.show_modal === false && offerData) {
              router.push(`/checkout?plan=${offerData?.slug}`);
            }
          } else {
            toast({
              title: t('alert-message:error-getting-offer'),
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            resolve({});
          }
        })
        .catch(() => {
          reject();
          toast({
            title: t('alert-message:error-getting-offer'),
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        });
    }),
  };
};

profileHandlers.propTypes = {
  translations: PropTypes.objectOf(PropTypes.any),
};

profileHandlers.defaultProps = {
  translations: {},
};

export default profileHandlers;
