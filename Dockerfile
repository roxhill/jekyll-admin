FROM ruby:2.5

ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

ENTRYPOINT ["/tini", "--"]

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - \
  && apt install -y nodejs build-essential

COPY . /usr/src/jekyll-admin
VOLUME /usr/src/jekyll-admin
WORKDIR /usr/src/jekyll-admin

RUN script/bootstrap
