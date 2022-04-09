/* eslint-disable no-param-reassign */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate } from '../../utils/date';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

/**
 * Utilizar o método query para buscar todos os posts e o getByUID para buscar
 * as informações do post específico.
 */

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  const countWords = post.data.content.reduce((acc, item) => {
    acc += item.heading.split(' ').length;

    const words = item.body.map(paragraph => paragraph.text.split(' ').length);

    // eslint-disable-next-line no-return-assign
    words.map(word => (acc += word));

    return acc;
  }, 0);

  const time = Math.ceil(countWords / 200);

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title> {post.data.title} | SpaceTravelling</title>
      </Head>

      <Header />

      <main>
        <article>
          {post.data.banner?.url && (
            <img
              src={post.data.banner.url}
              className={styles.banner}
              alt={post.data.title}
            />
          )}

          <div className={`${commonStyles.container} ${styles.post}`}>
            <h1>{post.data.title}</h1>
            <div className={commonStyles.info}>
              <time>
                <FiCalendar /> {formatDate(post.first_publication_date)}
              </time>

              <span>
                <FiUser /> {post.data.author}
              </span>

              <span>
                <FiClock /> {time} min
              </span>
            </div>
            <div className={styles.postContent}>
              {post.data.content.map((section, index) => (
                <div key={Number(index)}>
                  <h2>{section.heading}</h2>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(section.body),
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });
  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24, // 1 day
  };
};
