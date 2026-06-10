FROM ruby:3.4-slim

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
      libyaml-dev \
      git \
      curl \
      pkg-config && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Gemfile Gemfile.lock* ./
RUN bundle install

COPY . .
RUN chmod +x bin/rails

EXPOSE 3000

CMD ["bash", "-lc", "bundle check || bundle install && bin/rails db:prepare && bin/rails server -b 0.0.0.0 -p 3000"]
