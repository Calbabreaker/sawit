import Head from "next/head";

interface Props {
    title: string;
    description?: string;
}

export const MetaTags: React.FC<Props> = ({
    title,
    description = "Sawit - Instant posts on the go",
}) => {
    description = description.substring(0, 100);
    return (
        <Head>
            <title>{title}</title>
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:site" content="@fireship_dev" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {/* <meta name="twitter:image" content={image} /> */}

            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {/* <meta property="og:image" content={image} /> */}
        </Head>
    );
};
