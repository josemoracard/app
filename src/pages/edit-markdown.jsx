/* eslint-disable no-tabs */
import {
  Box, Img, useColorModeValue,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import getT from 'next-translate/getT';
import { useState, useEffect } from 'react';
import MarkDownParser from '../common/components/MarkDownParser';
import { usePersistent } from '../common/hooks/usePersistent';
import '@uiw/react-markdown-editor/markdown-editor.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@uiw/react-markdown-preview/markdown.css';
import markdownDefaultText from '../lib/markdown-example';
import useDebounce from '../common/hooks/useDebounce';

const MarkdownEditor = dynamic(
  () => import('@uiw/react-markdown-editor').then((mod) => mod.default),
  { ssr: false },
);

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'about-us');
  const image = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });

  return {
    props: {
      seo: {
        locales,
        locale,
        image,
        unlisted: true,
        pathConnector: '/edit-markdown',
      },
      fallback: false,
    },
  };
};

const EditMarkdown = () => {
  const [markdownSaved, setMarkdownSaved] = usePersistent('markdown', markdownDefaultText);
  const [markdownValue, setMarkdownValue] = useState(markdownSaved);
  const [isLoaded, setIsLoaded] = useState(false);
  const bgColor = useColorModeValue('white', 'darkTheme');
  const currentTheme = useColorModeValue('light', 'dark');

  const debouncedValue = useDebounce(markdownValue, 800);

  useEffect(() => {
    if (debouncedValue) setMarkdownSaved(debouncedValue);
  }, [debouncedValue]);

  useEffect(() => {
    if (currentTheme === 'light') {
      document.documentElement.setAttribute('data-color-mode', 'light');
    } else {
      document.documentElement.setAttribute('data-color-mode', 'dark');
    }
  }, [currentTheme]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 1200);
  }, []);

  return (
    <Box display="flex" flexDirection="column">
      {!isLoaded && (
        <Box position="absolute" background={bgColor} zIndex={99} h="100vh" display="flex" alignItems="center" justifyContent="center" width="100%">
          <Img src="/4Geeks.ico" width="35px" height="35px" position="absolute" mt="6px" zIndex="40" boxShadow="0px 0px 16px 0px #0097cd" borderRadius="40px" />
          <Box className="loader" />
        </Box>
      )}
      <MarkdownEditor
        value={markdownValue}
        style={{ height: '93vh', minWidth: '100%' }}
        visible
        onChange={(value) => {
          setMarkdownValue(value);
          // setMarkdownSaved(value);
        }}
        enableScroll
        // eslint-disable-next-line no-unused-vars
        renderPreview={({ source }, visible) => visible && (
          <Box className={`markdown-body ${currentTheme}`}>
            <MarkDownParser content={markdownSaved} />
          </Box>
        )}
        toolbars={[
          'undo', 'redo', 'bold', 'italic', 'header', 'strike', 'underline', 'quote', 'olist', 'ulist', 'todo',
          'link', 'image', 'code', 'codeBlock',
        ]}
      />

    </Box>
  );
};

export default EditMarkdown;
