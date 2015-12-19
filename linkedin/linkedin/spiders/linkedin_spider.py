from scrapy.spider import BaseSpider
from scrapy.selector import Selector


class LinkedinSpider(BaseSpider):
    name = "linkedin"
    allowed_domains = ["linkedin.com"]
    start_urls = ["https://us.linkedin.com/in/mohammed-lazhari-70069539"]

    def parse(self, response):
        sel = Selector(response)
        site = sel.xpath('//ul/li')
        for site in sites:
            title = site.xpath('a/text()').extract()
            link = site.xpath('a/@href').extract()
            desc = site.xpath('text()').extract()
            print title, link, desc
