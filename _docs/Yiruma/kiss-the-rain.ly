\version "2.22.0"

\header {
  title = "Kiss the rain"
  composer = "Yiruma"
  tagline = \markup {
    Engraved at
    \simple #(strftime "%Y-%m-%d" (localtime (current-time)))
    with \with-url #"http://lilypond.org/"
    \line { LilyPond \simple #(lilypond-version) (http://lilypond.org/) }
  }
}

\score {
  \relative c'' {
    \tempo 4 = 58
    \key aes \major
    
    s2. r16 ees aes bes
    bes8 c c2 r16 aes bes c
    bes8 ees ees2 r16 \ottava #1 ees f g
    g8 aes aes4. bes8 \acciaccatura bes \tuplet 3/2 { c bes aes }
    
    \break

    g2 r8 aes g ees
    ees f f2 r8 ees16 des
    des8 ees ees2 \ottava #0 r8 aes,16 bes
    c8 des des2 ees8 des
    
    \break
  
    c2 bes8 ees, aes bes
    bes c c2 r16 aes bes c
    bes8 ees ees2 r16 \ottava #1 ees f g
    g8 aes aes4. bes8 \tuplet 3/2 { c bes aes }
    
    \break
  
    g2 r8 aes g ees
    ees f f2 r8 ees16 des
    des8 ees ees2 \ottava #0 r8 aes,16 bes
    c8 des4 f,8 aes4 g
    
    \break

    aes2 r8 aes, c ees
    f2 aes,8 g aes f'
    ees2 r8 g, aes ees'
    ees des des c c bes bes aes
    
    \break
    
    bes c c4 r8 aes c ees
    f2 r8 g g f
    ees4. c16 des ees4 des8 c
    des4 ees f8. g aes8
    
    \break

    c2 bes8 ees, aes bes
    bes c c2 r16 aes bes c
    bes8 ees ees2 r16 \ottava #1 ees f g
    g8 aes aes4.
  }
  
  \layout {}
  \midi {}
}
