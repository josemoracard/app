import { Box, Button, Flex, Image, Modal, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useState } from 'react';
import useStyle from '../../hooks/useStyle';
import Heading from '../Heading';
import Text from '../Text';
import FinalProjectForm from './Form';

const FinalProjectModal = ({ storyConfig, isOpen, cohortData, studentsData, closeModal, closeOnOverlayClick }) => {
  const { t } = useTranslation('final-project');
  const [openForm, setOpenForm] = useState(false);
  const finalProjectTranslation = storyConfig?.translation?.[storyConfig?.locale]['final-project'];
  const bullets = finalProjectTranslation?.modal?.bullets || t('modal.bullets', {}, { returnObjects: true });
  const { lightColor, modal } = useStyle();

  const handleClose = () => {
    closeModal();
    setOpenForm(false);
  };

  return (
    <>
      <Modal closeOnOverlayClick={closeOnOverlayClick} isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent maxWidth="1045px" margin="6rem 10px 4rem 10px" background={modal.background}>
          <ModalCloseButton />
          <Flex flexDirection={{ base: 'column', md: 'row' }} gridGap="22px" padding="30px">
            <Box display="flex" alignItems="center" flex={0.6} borderRadius="17px">
              <Image src="/static/images/final_project.gif" objectFit="cover" borderRadius="17px" margin="0 auto" w="100%" h="100%" layout="fill" zIndex={10} top="0" left="0" />
            </Box>
            <Flex flexDirection="column" flex={0.4} width="100%" gridGap="16px" padding={{ base: '0', md: '20px' }}>
              <Heading size="sm" color={lightColor} letterSpacing="0.05em">
                {finalProjectTranslation?.modal?.subtitle || t('modal.subtitle')}
              </Heading>
              <Text size="18px">
                {finalProjectTranslation?.modal?.description || t('modal.description')}
              </Text>
              <Flex flexDirection="column" gridGap="8px">
                {bullets.map((bullet) => (
                  <Text size="18px" key={bullet} dangerouslySetInnerHTML={{ __html: bullet }} />
                ))}
              </Flex>
              <Button variant="default" onClick={() => setOpenForm(true)} width="fit-content" margin="auto 0 0 0" padding="0 1.8rem">
                {finalProjectTranslation?.modal?.button || t('modal.button')}
              </Button>
            </Flex>
          </Flex>
        </ModalContent>
      </Modal>
      {openForm && (
        <Modal size="lg" isOpen={openForm} onClose={setOpenForm}>
          <ModalOverlay />
          <ModalContent margin="5rem 0 4rem 0" background={modal.background} borderRadius="13px">
            <ModalCloseButton />
            <FinalProjectForm
              storyConfig={storyConfig}
              cohortData={cohortData}
              studentsData={studentsData}
              handleClose={handleClose}
            />
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

FinalProjectModal.propTypes = {
  storyConfig: PropTypes.objectOf(PropTypes.any),
  isOpen: PropTypes.bool,
  cohortData: PropTypes.objectOf(PropTypes.any),
  studentsData: PropTypes.arrayOf(PropTypes.object),
  closeModal: PropTypes.func,
  closeOnOverlayClick: PropTypes.bool,
};
FinalProjectModal.defaultProps = {
  storyConfig: {},
  isOpen: false,
  cohortData: {},
  studentsData: [],
  closeModal: () => {},
  closeOnOverlayClick: true,
};

export default FinalProjectModal;
