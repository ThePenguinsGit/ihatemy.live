export default eventHandler(async (event) => {
    return (await queryCollection(event, 'docs').all()).map(
        (doc) => ({
            title: doc.title,
            url: doc.sitemap?.loc,
        }),
    ).filter(
        (doc) => doc.url !== undefined && doc.url.lastIndexOf('/') !== 0,
    )
})