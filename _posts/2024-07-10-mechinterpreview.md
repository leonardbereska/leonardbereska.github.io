---
layout: mechinterpreview 
title: Mechanistic Interpretability for AI Safety — A Review
description: A comprehensive review of mechanistic interpretability, an approach to reverse engineering neural networks into human-understandable algorithms and concepts, focusing on its relevance to AI safety. 
tags: mechanistic interpretability AI safety review
giscus_comments: true
date: 2024-07-10 
featured: false 
authors:
  - name: Leonard Bereska 
    url: "https://leonardbereska.github.io/"
    affiliations:
      name: University of Amsterdam 
  - name: Efstratios Gavves 
    url: "https://www.egavves.com/"
    affiliations:
      name: University of Amsterdam

bibliography: 2024-07-10-mechinterpreview.bib

# Optionally, you can add a table of contents to your post.
# NOTES:
#   - make sure that TOC names match the actual section names
#     for hyperlinks within the post to work correctly.
#   - we may want to automate TOC generation in the future using
#     jekyll-toc plugin (https://github.com/toshimaru/jekyll-toc).
toc:
  - name: Introduction 
  - name: Interpretability Paradigms from the Outside In
  - name: Core Concepts and Assumptions 
    subsections:
      - name: Defining Features as Representational Primitives
      - name: Nature of Features - From Monosemantic Neurons to Non-Linear Representations
      - name: Circuits as Computational Primitives and Motifs as Universal Circuit Patterns 
      - name: Emergence of World Models and Simulated Agents
  - name: Core Methods 
    subsections:
      - name: Observation
      - name: Intervention
        subsubsections:
          - name: Activation Patching
          - name: Causal Abstraction
          - name: Hypothesis Testing 
      - name: Integrating Observation and Intervention
  - name: Current Research
    subsections:
      - name: Intrinsic Interpretability 
      - name: Developmental Interpretability
      - name: Post-hoc Interpretability 
      - name: Automation - Scaling Post-hoc Interpretability 
  - name: Relevance to AI Safety
    subsections:
      - name: How Could Interpretability Promote AI Safety?
      - name: How Could Mechanistic Insight Be Harmful? 
  - name: Challenges
    subsections:
      - name: Research Issues 
      - name: Technical Limitations 
  - name: Future Directions 
    subsections:
      - name: Clarifying Concepts 
      - name: Setting Standards 
      - name: Scaling Techniques
      - name: Expanding Scope 
    
    # if a section has subsections, you can add them as follows:
    # subsections:
      # - name: Example Child Subsection 1
      # - name: Example Child Subsection 2

# Below is an example of injecting additional post-specific styles.
# If you use this post as a template, delete this _styles block.
# _styles: >
#   .fake-img {
#     background: #bbb;
#     border: 1px solid rgba(0, 0, 0, 0.1);
#     box-shadow: 0 0px 4px rgba(0, 0, 0, 0.1);
#     margin-bottom: 12px;
#   }
#   .fake-img p {
#     font-family: monospace;
#     color: white;
#     text-align: left;
#     margin: 12px 0;
#     text-align: center;
#     font-size: 16px;
#   }

---

Understanding AI systems' inner workings is critical for ensuring value alignment and safety. This review explores mechanistic interpretability: reverse engineering the computational mechanisms and representations learned by neural networks into human-understandable algorithms and concepts to provide a granular, causal understanding.
We establish foundational concepts such as features encoding knowledge within neural activations and hypotheses about their representation and computation. We survey methodologies for causally dissecting model behaviors and assess the relevance of mechanistic interpretability to AI safety. We examine benefits in understanding, control, and alignment, along with risks such as capability gains and dual-use concerns. 
We investigate challenges surrounding scalability, automation, and comprehensive interpretation. We advocate for clarifying concepts, setting standards, and scaling techniques to handle complex models and behaviors and expand to domains such as vision and reinforcement learning. Mechanistic interpretability could help prevent catastrophic outcomes as AI systems become more powerful and inscrutable.

## Introduction

As AI systems rapidly become more sophisticated and general <d-cite key="bubeck_sparks_2023,bengio_managing_2023"></d-cite>, advancing our understanding of these systems is crucial to ensure their alignment <d-cite key="ji_ai_2024"></d-cite> with human values and avoid catastrophic outcomes <d-cite key="hendrycks_overview_2023,hendrycks_xrisk_2022"></d-cite>. The field of interpretability aims to demystify the internal processes of AI models, moving beyond evaluating performance alone. This review focuses on mechanistic interpretability, an emerging approach within the broader interpretability landscape that strives to comprehensively specify the computations underlying deep neural networks. We emphasize that understanding and interpreting these complex systems is not merely an academic endeavor -- *it's a societal imperative to ensure AI remains trustworthy and beneficial*.

The interpretability landscape is undergoing a paradigm shift akin to the evolution from behaviorism to cognitive neuroscience in psychology. Historically, lacking tools for introspection, psychology treated the mind as a black box, focusing solely on observable behaviors. Similarly, interpretability has predominantly relied on black-box techniques <d-cite key="casper_blackbox_2024"></d-cite>, analyzing models based on input-output relationships or using attribution methods that, while probing deeper, still neglect the model's internal architecture. However, just as advancements in neuroscience allowed for a deeper understanding of internal cognitive processes, the field of interpretability is now moving towards a more granular approach. This shift from surface-level analysis to a focus on the internal mechanics of deep neural networks characterizes the transition towards inner interpretability <d-cite key="rauker_transparent_2023"></d-cite>.

Mechanistic interpretability, as an approach to inner interpretability, aims to completely specify a neural network's computation, potentially in a format as explicit as pseudocode (also called {% term reverse engineering %}), striving for a granular and precise understanding of model behavior. It distinguishes itself primarily through its *ambition* for comprehensive reverse engineering and its strong *motivation* towards AI safety. Our review serves as the first comprehensive exploration of mechanistic interpretability research, with the most accessible introductions currently scattered in a blog or list format <d-cite key="olah_mechanistic_2022,nanda_comprehensive_2022,olah_zoom_2020,sharkey_current_2022,olah_building_2018,nanda_mechanistic_2023,nanda_extremely_2024"></d-cite>. Concurrently, <d-cite key="ferrando_primer_2024"></d-cite> and <d-cite key="rai_practical_2024"></d-cite> have also contributed valuable reviews giving concise, technical introductions to mechanistic interpretability in transformer-based language models. Our work complements these efforts by synthesizing the research (addressing the "research debt" <d-cite key="olah_research_2017"></d-cite>) and providing a structured, accessible, and comprehensive introduction for AI researchers and practitioners.

The structure of this paper provides a cohesive overview of mechanistic interpretability, situating the mechanistic approach in the broader interpretability landscape ([Section 2](#interpretability-paradigms-from-the-outside-in)), presenting core concepts and hypotheses ([Section 3](#core-concepts-and-assumptions)), explaining methods and techniques ([Section 4](#core-methods)), presenting a taxonomy and survey of the current field ([Section 5](#current-research)), exploring relevance to AI safety ([Section 6](#relevance-to-ai-safety)), and addressing challenges ([Section 7](#challenges)) and future directions ([Section 8](#future-directions)).

## Interpretability Paradigms from the Outside In

We encounter a spectrum of interpretability paradigms for decoding AI systems' decision-making, ranging from external black-box techniques to internal analyses. We contrast these paradigms with mechanistic interpretability, highlighting its distinct causal bottom-up perspective within the broader interpretability landscape (see <a href="#fig:paradigms" class="figure-ref">Figure 1</a>).

<figure id="fig:paradigms">
<img src="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/paradigms.png" alt="Figure comparing behavioral, attributional, concept-based, and mechanistic interpretability paradigms" style="width: 100%;"/>
<figcaption style="color: var(--global-text-color); margin-top: 0.5em;"><strong>Figure 1:</strong> Interpretability paradigms offer distinct lenses for understanding neural networks: <strong>Behavioral</strong> analyzes input-output relations; <strong>Attributional</strong> quantifies individual input feature influences; <strong>Concept-based</strong> identifies high-level representations governing behavior; <strong>Mechanistic</strong> uncovers precise causal mechanisms from inputs to outputs.</figcaption>
</figure>

**Behavioral** interpretability treats the model as a black box, analyzing input-output relations. Techniques such as minimal pair analysis <d-cite key="warstadt_blimp_2020"></d-cite>, sensitivity and perturbation analysis <d-cite key="casalicchio_visualizing_2018"></d-cite> examine input-output relations to assess the model's robustness and variable dependencies <d-cite key="shapley_value_1988,ribeiro_why_2016,covert_explaining_2021"></d-cite>. Its *model-agnostic* nature is practical for complex or proprietary models but lacks insight into internal decision processes and causal depth <d-cite key="jumelet_evaluating_2023"></d-cite>.

**Attributional** interpretability aims to explain outputs by tracing predictions to individual input contributions using gradients. Raw gradients can be discontinuous or sensitive to slight perturbations. Therefore, techniques such as SmoothGrad <d-cite key="smilkov_smoothgrad_2017"></d-cite> and Integrated Gradients <d-cite key="sundararajan_axiomatic_2017"></d-cite> average across gradients. Other popular techniques are layer-wise relevance propagation <d-cite key="bach_pixelwise_2015"></d-cite>, DeepLIFT <d-cite key="shrikumar_learning_2017"></d-cite>, or GradCAM <d-cite key="selvaraju_gradcam_2016"></d-cite>. Attribution enhances transparency by showing input feature influence without requiring an understanding of the internal structure, enabling decision validation, compliance, and trust while serving as a bias detection tool, but also has fundamental limitations <d-cite key="bilodeau_impossibility_2024"></d-cite>.

**Concept-based** interpretability adopts a top-down approach to unraveling a model's decision-making processes by probing its learned representations for high-level concepts and patterns governing behavior. Techniques include training supervised auxiliary classifiers <d-cite key="belinkov_probing_2021"></d-cite>, employing unsupervised contrastive and structured probes (see [Section 4.1](#feature-disentanglement-via-sparse-dictionary-learning)) to explore latent knowledge <d-cite key="burns_discovering_2023"></d-cite>, and using neural representation analysis to quantify the representational similarities between the internal representations learned by different neural networks <d-cite key="kornblith_similarity_2019,bansal_revisiting_2021"></d-cite>. 
Beyond observational analysis, concept-based interpretability can enable manipulation of these representations -- also called {% term representation engineering %} <d-cite key="zou_representation_2023"></d-cite> -- potentially enhancing safety by upregulating concepts such as honesty, harmlessness, and morality.

**Mechanistic** interpretability is a bottom-up approach that studies the fundamental components of models through granular analysis of features, neurons, layers, and connections, offering an intimate view of operational mechanics. Unlike concept-based interpretability, it aims to uncover causal relationships and precise computations transforming inputs into outputs, often identifying specific neural circuits driving behavior. This {% term reverse engineering %} approach draws from interdisciplinary fields like physics, neuroscience, and systems biology to guide the development of transparent, value-aligned AI systems. Mechanistic interpretability is the primary focus of this review. 

## Core Concepts and Assumptions 

This section introduces the key concepts and hypotheses of mechanistic interpretability, as summarized in <a href="#fig:overview" class="figure-ref">Figure 2</a>. We start by defining features as the basic units of representation ([Section 3.1](#defining-features-as-representational-primitives)). We then examine the nature of these features, including the challenges posed by polysemantic neurons and the implications of the superposition and linear representation hypotheses ([Section 3.2](#nature-of-features-from-monosemantic-neurons-to-non-linear-representations)).

<figure id="fig:overview">
<img src="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/overview.png" alt="Figure showing key concepts and hypotheses in mechanistic interpretability" style="width: 100%;"/>
<figcaption style="color: var(--global-text-color); margin-top: 0.5em;">
<strong>Figure 2:</strong> Overview of key concepts and hypotheses in mechanistic interpretability, organized into four subsection (pink boxes): defining <span class="glossary-term" data-term="features">features</span> (<a href="#defining-features-as-representational-primitives">Section 3.1</a>), representation (<a href="#nature-of-features-from-monosemantic-neurons-to-non-linear-representations">Section 3.2</a>), computation (<a href="circuits-as-computational-primitives-and-motifs-as-universal-circuit-patterns
">Section 3.3</a>), and emergence (<a href="#emergence-of-world-models-and-simulated-agents">Section 3.4</a>). In turquoise, it highlights definitions like {% term features %}, {% term circuits %}, and {% term motifs %}, and in orange, it highlights hypotheses like {% term linear representation %}, {% term superposition %}, {% term universality %}, {% term simulation %}, and {% term prediction orthogonality %}. Arrows show relationships, e.g., superposition enabling an alternative feature definition or universality connecting circuits and motifs.
</figcaption>
</figure>

### Defining Features as Representational Primitives

The notion of a *feature* in neural networks is central yet elusive, reflecting the pre-paradigmatic state of mechanistic interpretability. We adopt the notion of {% term features %} as the *fundamental units of neural network representations*, such that features cannot be further {% term disentangled %} into simpler, distinct factors. These features are core components of a neural network's representation, analogous to how cells form the fundamental unit of biological organisms <d-cite key="olah_zoom_2020"></d-cite>.

<div class="definition-box">
  <h4 class="definition-title">Definition 1: Feature</h4>
  <p class="definition-content">Features are the fundamental units of neural network representations that cannot be further decomposed into simpler independent factors.</p>
</div>

#### Concepts as natural abstractions

The world consists of various entities that can be grouped into categories or {% term concepts %} based on shared properties. These concepts form high-level summaries like "tree" or "velocity," allowing compact world representations by discarding many irrelevant low-level details. Neural networks can capture and represent such {% term natural abstractions %} <d-cite key="chan_natural_2023"></d-cite> through their learned {% term features %}, which serve as building blocks of their internal representations, aiming to capture the {% term concepts %} underlying the data.

#### Features encoding input patterns

In traditional machine learning, {% term features %} are understood as characteristics or attributes derived directly from the input data stream <d-cite key="bishop_pattern_2006"></d-cite>. This view is particularly relevant for systems focused on *perception*, where features map closely to the input data. However, in more advanced systems capable of *reasoning* with abstractions, features may emerge internally within the model as representational patterns, even when processing information unrelated to the input. In this context, features are better conceptualized as *any measurable property or characteristic of a phenomenon* <d-cite key="olah_mechanistic_2022"></d-cite>, encoding abstract {% term concepts %} rather than strictly reflecting input attributes.

#### Features as representational atoms

A key property of features is their irreducibility, meaning they cannot be decomposed into or expressed as a combination of simpler, independent factors. In the context of input-related features, Engels <em>et al.</em> <d-cite key="engels_not_2024"></d-cite> define a feature as {% term irreducible %} if it cannot be decomposed into or expressed as a combination of statistically independent patterns or factors in the original input data. Specifically, a feature is reducible if transformations reveal its underlying pattern, which can be separated into independent co-occurring patterns or is a mixture of patterns that never co-occur. We propose generalizing this notion of irreducibility to features encoding abstract concepts not directly tied to input patterns, such that features cannot be reduced to combinations or mixtures of other independent components within the model's representations.

#### Features beyond human interpretability

Features could be defined from a *human-centric perspective* as *semantically meaningful, articulable input patterns encoded in the network's activation space* <d-cite key="olah_mechanistic_2022"></d-cite>. However, while cognitive systems may converge on similar {% term natural abstractions %} <d-cite key="chan_natural_2023"></d-cite>, these need not necessarily align with human-interpretable {% term concepts %}.
Adversarial examples have been interpreted as non-interpretable features meaningful to models but not humans. Imperceptible perturbations fool networks, suggesting reliance on alien representational patterns <d-cite key="ilyas_adversarial_2019"></d-cite>. As models surpass human capabilities, their learned features may become increasingly abstract, encoding information in ways incongruent with human intuition <d-cite key="hubinger_chris_2019"></d-cite>.
Mechanistic interpretability aims to uncover the *actual* representations learned, even if diverging from human concepts. While human-interpretable concepts provide guidance, a non-human-centric perspective that defines features as independent model components, whether aligned with human concepts or not, is a more comprehensive and future-proof approach.

### Nature of Features: From Monosemantic Neurons to Non-Linear Representations {#nature-of-features-from-monosemantic-neurons-to-non-linear-representations}

<figure id="fig:privileged">
  <img src="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/monosemantic.png" alt="Contrasting privileged and non-privileged bases" style="width: 100%;"/>
  <figcaption style="color: var(--global-text-color);">
    <strong>Figure 3:</strong> Contrasting privileged and non-privileged bases. In a non-privileged basis, there is no reason to expect features to be basis-aligned — calling basis dimensions neurons has no meaning. In a privileged basis, the architecture treats basis directions differently — features can but need not align with neurons <d-cite key="bricken_monosemanticity_2023"></d-cite>. <strong>Leftmost:</strong> Privileged basis; individual features (arrows) align with basis directions, resulting in {% term monosemantic %} neurons (colored circles). <strong>Middle left:</strong> Privileged basis, where despite having more features than neurons, some neurons are monosemantic, representing individual features, while others are {% term polysemantic %} (overlapping gradients), encoding {% term superposition %} of multiple features. <strong>Middle right:</strong> Non-privileged basis where, even when the number of features equals the number of neurons, the lack of alignment between the feature directions and basis directions results in polysemantic neurons encoding combinations of features. <strong>Rightmost:</strong> Non-privileged, polysemantic neurons as feature directions do not align with neuron basis.
    <a href="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/monosemantic.pdf" target="_blank">(View PDF)</a>
  </figcaption>
</figure>

#### Neurons as Computational Units?

In the architecture of neural networks, neurons are the natural computational units, potentially representing individual features. Within a neural network representation $h\in \mathbb{R}^n$, the $n$ basis directions are called neurons. For a neuron to be meaningful, the basis directions must functionally differ from other directions in the representation, forming a {% term privileged basis %} -- where the basis vectors are architecturally distinguished within the neural network layer from arbitrary directions in activation space, as shown in [Figure 3](#fig:privileged). Typical non-linear activation functions privilege the basis directions formed by the neurons, making it meaningful to analyze individual neurons <d-cite key="elhage_toy_2022"></d-cite>. Analyzing neurons can give insights into a network's functionality <d-cite key="sajjad_neuronlevel_2022,mu_compositional_2020,dai_knowledge_2022,ghorbani_neuron_2020,voita_neurons_2023,durrani_analyzing_2020,goh_multimodal_2021,bills_language_2023,huang_rigorously_2023"></d-cite>.

#### Monosemantic and Polysemantic Neurons

A neuron corresponding to a single semantic concept is called {% term monosemantic %}. The intuition behind this term comes from analyzing what inputs activate a given neuron, revealing its associated semantic meaning or concept. If neurons were the representational primitives of neural networks, all neurons would be monosemantic, implying a one-to-one relationship between neurons and features. Comprehensive interpretability would be as tractable as characterizing all neurons and their connections. However, empirically, especially for transformer models <d-cite key="elhage_toy_2022"></d-cite>, neurons are often observed to be {% term polysemantic %}, *i.e.*, associated with multiple, unrelated concepts <d-cite key="arora_linear_2018,mu_compositional_2020,elhage_softmax_2022,olah_zoom_2020"></d-cite>. For example, a single neuron may be activated by both images of cats and images of cars, suggesting it encodes multiple unrelated concepts. Polysemanticity contradicts the interpretation of neurons as representational primitives and, in practice, makes it challenging to understand the information processing of neural networks.

#### Exploring Polysemanticity: Hypotheses and Implications

To understand the widespread occurrence of polysemanticity in neural networks, several hypotheses have been proposed:

- One trivial scenario would be that feature directions are orthogonal but not aligned with the basis directions (neurons). There is no inherent reason to assume that features would align with neurons in a non-privileged basis, where the basis vectors are not architecturally distinguished. However, even in a privileged basis formed by the neurons, the network could represent features not in the standard basis but as linear combinations of neurons (see [Figure 3](#fig:privileged), middle right).
- An alternative hypothesis posits that *redundancy due to noise* introduced during training, such as random dropout <d-cite key="srivastava_dropout_2014"></d-cite>, can lead to redundant representations and, consequently, to polysemantic neurons <d-cite key="marshall_understanding_2024"></d-cite>. This process involves distributing a single feature across several neurons rather than isolating it into individual ones, thereby encouraging polysemanticity.
- Finally, the {% term superposition %} hypothesis addresses the limitations in the network's representative capacity -- the number of neurons versus the number of crucial concepts. This hypothesis argues that the limited number of neurons compared to the vast array of important concepts necessitates a form of compression. As a result, an $n$-dimensional representation may encode features not with the $n$ basis directions (neurons) but with the $\propto \exp (n)$ possible almost orthogonal directions <d-cite key="elhage_toy_2022"></d-cite>, leading to polysemanticity.

<div class="hypothesis-box">
  <h4 class="hypothesis-title">Hypothesis 1: Superposition</h4>
  <p class="hypothesis-content">Neural networks represent more features than they have neurons by encoding features in overlapping combinations of neurons.</p>
</div>

#### Superposition Hypothesis

The {% term superposition %} hypothesis suggests that neural networks can leverage high-dimensional spaces to represent more features than their actual neuron count by encoding features in almost orthogonal directions. Non-orthogonality means that features interfere with one another. However, the benefit of representing many more features than neurons may outweigh the interference cost, mainly when concepts are sparse and non-linear activation functions can error-correct noise <d-cite key="elhage_toy_2022"></d-cite>.

<div class="explanation-box">
 <h4 class="explanation-title">Toy Model of Superposition</h4>
 <p class="explanation-content">
   A toy model <d-cite key="elhage_toy_2022"></d-cite> investigates the hypothesis that neural networks can represent more {% term features %} than the number of neurons by encoding real-world {% term concepts %} in a compressed manner. The model considers a high-dimensional vector $\mathbf{x}$, where each element $x_i$ corresponds to a feature capturing a real-world concept, represented as a random vector with varying importance determined by a weight $a_i$. These features are assumed to have the following properties: 1) <strong>Concept sparsity</strong>: Real-world concepts occur sparsely. 2) <strong>More concepts than neurons</strong>: The number of potential concepts vastly exceeds the available neurons. 3) <strong>Varying concept importance</strong>: Some concepts are more important than others for the task at hand.

   The input vector $\mathbf{x}$ represents features capturing these concepts, defined by a sparsity level $S$ and an importance level $a_i$ for each feature $x_i$, reflecting the sparsity and varying importance of the underlying concepts. The model dynamics involve transforming $\mathbf{x}$ into a hidden representation $\mathbf{h}$ of lower dimension, and then reconstructing it as $\mathbf{x'}$:
  
  <div>
   <p></p>
  <div class="math-block" style="text-align: center;"> $\mathbf{h} = \mathbf{W}\mathbf{x}, \quad \mathbf{x'} = \text{ReLU}(\mathbf{W}^T\mathbf{h} + \mathbf{b}) $. </div>
   <p></p>
  </div>

   The network's performance is evaluated using a loss function $\mathcal{L}$ weighted by the feature importances $a_i$, reflecting the importance of the underlying concepts:
   <div>
   <p></p>
   <div class="math-block" style="text-align: center;"> $ \mathcal{L}= \sum_{x}\sum_{i} a_i (x_i - x'_i)^2 $.</div>
   <p></p>
  </div>
 
   This toy model highlights neural networks' ability to encode numerous features representing real-world concepts into a compressed representation, providing insights into the superposition phenomenon observed in neural networks trained on real data.
<figure id="fig:superposition">
 <div class="center-figure">
   <img src="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/superposition.png" alt="Toy model of superposition" style="width: 80%; margin: auto;">
</div>
   <!-- superposition.png" alt="Toy model of superposition" style="width: 80%; margin: auto;"> -->
   <figcaption>
     <strong>Figure 4:</strong> Illustration of the toy model architecture and the effects of sparsity. <strong>(left)</strong> Transformation of a five-feature input vector $\mathbf{x}$ into a two-dimensional hidden representation $\mathbf{h}$, and its reconstruction as $\mathbf{x}'$ using the weight matrix $W$ and its transpose, with feature importance indicated by a color gradient from yellow to green. <strong>(right)</strong> The effect of increasing feature sparsity $S$ on the encoding capacity of the network, highlighting the network's enhanced ability to represent features in superposition as sparsity increases from $0$ to $0.9$, illustrated by arrows in the activation space $\mathbf{h}$, which correspond to the columns of the matrix $W$. <a href="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/superposition.pdf" target="_blank">(View PDF)</a>
   </figcaption>
 </figure>
 </p>
</div>

Toy models can demonstrate under which conditions superposition occurs <d-cite key="elhage_toy_2022,scherlis_polysemanticity_2023"></d-cite>. Neural networks, via superposition, may effectively simulate computation with more neurons than they possess by allocating each feature to a linear combination of neurons, creating what is known as an overcomplete linear basis in the representation space. This perspective on superposition suggests that polysemantic models could be seen as compressed versions of hypothetically larger neural networks where each neuron represents a single concept (see [Figure 5](#fig:polysemanticity)). Consequently, an alternative definition of features could be:

<div class="definition-box">
 <h4 class="definition-title">Feature (Alternative)</h4>
 <p class="definition-content">
   Features are elements that a network would ideally assign to individual neurons if neuron count were not a limiting factor <d-cite key="bricken_monosemanticity_2023"></d-cite>. In other words, {% term features %} correspond to the disentangled {% term concepts %} that a larger, sparser network with sufficient capacity would learn to represent with individual neurons.
 </p>
</div>

<figure id="fig:polysemanticity">
  <div class="center-figure">
    <img src="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/polysemanticity.png" alt="Polysemanticity in neural networks" style="width: 100%;">
  </div>
 <figcaption style="color: var(--global-text-color);">
   <strong>Figure 5:</strong> Observed neural networks <strong>(left)</strong> can be viewed as compressed simulations of larger, sparser networks <strong>(right)</strong> where neurons represent distinct features. An "almost orthogonal" projection compresses the high-dimensional sparse representation, manifesting as polysemantic neurons involved with multiple features in the lower-dimensional observed model, reflecting the compressed encoding. Figure adapted from <d-cite key="bricken_monosemanticity_2023"></d-cite>. <a href="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/polysemanticity.pdf" target="_blank">(View PDF)</a>
 </figcaption>
</figure>

Research on superposition, including works by <d-cite key="elhage_toy_2022,scherlis_polysemanticity_2023,henighan_superposition_2023"></d-cite>, often investigates simplified models. However, understanding superposition in practical, transformer-based scenarios is crucial for real-world applications, as pioneered by Gurnee <em>et al.</em> <d-cite key="gurnee_finding_2023"></d-cite>.

The need for understanding networks despite polysemanticity has led to various approaches: One involves training models without superposition <d-cite key="jermyn_engineering_2022"></d-cite>, for example, using a softmax linear unit <d-cite key="elhage_softmax_2022"></d-cite> as an activation function to empirically increase the number of {% term monosemantic %} neurons, but at the cost of making other neurons less interpretable. From a capabilities standpoint, polysemanticity may be desirable as it allows models to represent more concepts with limited compute, making training cheaper. Overall, engineering monosemanticity has proven challenging <d-cite key="bricken_monosemanticity_2023"></d-cite> and may be impractical until we have orders of magnitude more compute available.

Another approach is to train networks in a standard way (creating polysemanticity) and use post-hoc analysis to find the feature directions in activation space, for example, with Sparse Autoencoders (SAEs). SAEs aim to find the true, disentangled features in an uncompressed representation by learning a sparse overcomplete basis that describes the activation space of the trained model <d-cite key="bricken_monosemanticity_2023,sharkey_taking_2022,cunningham_sparse_2024"></d-cite> (also see [Section 4.1](#feature-disentanglement-via-sparse-dictionary-learning)).

#### If not neurons, what are features then?

We want to identify the fundamental units of neural networks, which we call {% term features %}. Initially, neurons seemed likely candidates. However, this view fell short, particularly in transformer models where neurons often represent multiple concepts, a phenomenon known as polysemanticity. The superposition hypothesis addresses this, proposing that due to limited representational capacity, neural networks compress numerous features into the confined space of neurons, complicating interpretation.

This raises the question: *How are features encoded if not in discrete neuron units?* While a priori features could be encoded in an arbitrarily complex, non-linear structure, a growing body of theoretical arguments and empirical evidence supports the hypothesis that features are commonly represented linearly, i.e., as linear combinations of neurons — hence, as directions in representation space. This perspective promises to enhance our comprehension of neural networks by providing a more interpretable and manipulable framework for their internal representations.

<div class="hypothesis-box">
 <h4 class="hypothesis-title">Linear Representation</h4>
 <p class="hypothesis-content">
   Features are directions in activation space, <em>i.e.</em> linear combinations of neurons.
 </p>
</div>

The {% term linear representation %} hypothesis suggests that neural networks frequently represent high-level features as linear directions in activation space. This hypothesis can simplify the understanding and manipulation of neural network representations <d-cite key="nanda_emergent_2023"></d-cite>. The prevalence of linear layers in neural network architectures favors linear representations. Matrix multiplication in these layers most readily processes linear features, while more complex non-linear encodings would require multiple layers to decode. 

However, recent work by Engels <em>et al.</em> <d-cite key="engels_not_2024"></d-cite> provides evidence against a strict formulation of the linear representation hypothesis by identifying circular features representing days of the week and months of the year. These multi-dimensional, non-linear representations were shown to be used for solving modular arithmetic problems in days and months. Intervention experiments confirmed that these circular features are the fundamental unit of computation in these tasks, and the authors developed methods to decompose the hidden states, revealing the circular representations.

Establishing non-linearity can be challenging. For example, Li <em>et al.</em> <d-cite key="li_emergent_2023"></d-cite> initially found that in a GPT model trained on Othello, the board state could only be decoded with a non-linear probe when represented in terms of "black" and "white" pieces, seemingly violating the linearity assumption. However, Nanda <em>et al.</em> <d-cite key="nanda_actually_2023,nanda_emergent_2023"></d-cite> later showed that a linear probe sufficed when the board state was decoded in terms of "own" and "opponent's" pieces, reaffirming the linear representation hypothesis in this case. In contrast, the work by Engels <em>et al.</em> <d-cite key="engels_not_2024"></d-cite> provides a clear and convincing existence proof for non-linear, multi-dimensional representations in language models.

While the linear representation hypothesis remains a useful simplification, it is important to recognize its limitations and the potential role of non-linear representations <d-cite key="sharkey_current_2022"></d-cite>. As neural networks continue to evolve, ongoing reevaluation of the hypothesis is crucial, particularly considering the possible emergence of non-linear features under optimization pressure for interpretability <d-cite key="hubinger_transparency_2022"></d-cite>. Alternative perspectives, such as the polytope lens proposed by Black <em>et al.</em> <d-cite key="black_interpreting_2022"></d-cite>, emphasize the impact of non-linear activation functions and discrete polytopes formed by piecewise linear activations as potential primitives of neural network representations.

Despite these exceptions, empirical evidence largely supports the linear representation hypothesis in many contexts, especially for feedforward networks with ReLU activations. Semantic vector calculus in word embeddings <d-cite key="mikolov_distributed_2013"></d-cite>, successful linear probing <d-cite key="alain_understanding_2016,belinkov_probing_2021"></d-cite>, sparse dictionary learning <d-cite key="bricken_monosemanticity_2023,cunningham_sparse_2024,deng_measuring_2023"></d-cite>, and linear decoding of concepts <d-cite key="omahony_disentangling_2023"></d-cite>, tasks <d-cite key="hendel_incontext_2023"></d-cite>, functions <d-cite key="todd_function_2023"></d-cite>, sentiment <d-cite key="tigges_language_2024"></d-cite>, refusal <d-cite key="arditi_refusal_2024"></d-cite>, and relations <d-cite key="hernandez_linearity_2023,chanin_identifying_2023"></d-cite> in large language models all point to the prevalence of linear representations. Moreover, linear addition techniques for model steering <d-cite key="turner_activation_2023,sakarvadia_memory_2023,li_inferencetime_2023"></d-cite> and {% term representation engineering %} <d-cite key="zou_representation_2023"></d-cite> highlight the practical implications of linear feature representations.

Building upon the linear representation hypothesis, recent work investigated the structural organization of these linear features within activation space. Park <em>et al.</em> <d-cite key="park_geometry_2024"></d-cite> reveal a geometric framework for categorical and hierarchical concepts in large language models. Their findings demonstrate that simple categorical concepts (e.g., mammal, bird) are represented as simplices in the activation space, while hierarchically related concepts are orthogonal. This geometric analysis aligns with earlier observations on feature clustering and splitting in neural networks <d-cite key="elhage_toy_2022"></d-cite>. It suggests that the linear features are not merely scattered directions but are organized to reflect semantic relationships and hierarchies.

### Circuits as Computational Primitives and Motifs as Universal Circuit Patterns

Having defined features as directions in activation space as the fundamental units of neural network representation, we now explore their computation. Neural networks can be conceptualized as computational graphs, within which {% term circuits %} are sub-graphs consisting of linked features and the weights connecting them. Similar to how features are the representational primitive, circuits function as the computational primitive <d-cite key="michaud_quantization_2023"></d-cite> and the primary building block of these networks <d-cite key="olah_zoom_2020"></d-cite>.

<figure id="fig:motif">
 <img src="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/motif.png" alt="Motifs in neural networks" style="width: 100%;">
 <figcaption style="color: var(--global-text-color);">
   <strong>Figure 6:</strong> Comparing observed models <strong>(left)</strong> and corresponding hypothetical {% term disentangled %} models <strong>(right)</strong> trained on similar tasks and data. The observed models show different neuronal activation patterns, while the dissection into feature-level {% term circuits %} reveals a <em>motif</em> — a shared circuit pattern emerging across models, hinting at {% term universality %} — models converging on similar solutions based on common underlying principles.
   <a href="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/motif.pdf" target="_blank">(View PDF)</a>
 </figcaption>
</figure>

<div class="definition-box">
 <h4 class="definition-title">Circuit</h4>
 <p class="definition-content">
   Circuits are sub-graphs of the network, consisting of features and the weights connecting them.
 </p>
</div>

The decomposition of neural networks into circuits for interpretability has shown significant promise, particularly in small models trained for specific tasks such as addition, as seen in the work of Nanda <em>et al.</em> <d-cite key="nanda_progress_2023"></d-cite> and Quirke <em>et al.</em> <d-cite key="quirke_understanding_2023"></d-cite>. Scaling such a *comprehensive* circuit analysis to broader behaviors in large language models remains challenging. However, there has been notable progress in scaling circuit analysis of *narrow behaviors* to larger circuits and models, such as indirect object identification <d-cite key="wang_interpretability_2023"></d-cite> and greater-than computations <d-cite key="hanna_how_2023"></d-cite> in GPT-2 and multiple-choice question answering in Chinchilla <d-cite key="lieberum_does_2023"></d-cite>.

In search of general and universal circuits, researchers focus particularly on more general and transferable behaviors. McDougall <em>et al.</em>'s <d-cite key="mcdougall_copy_2023"></d-cite> work on copy suppression in GPT-2's attention heads sheds light on model calibration and self-repair mechanisms. Davies <em>et al.</em> <d-cite key="davies_discovering_2023"></d-cite> and Feng <em>et al.</em> <d-cite key="feng_how_2023"></d-cite> focus on how large language models represent symbolic knowledge through variable binding and entity-attribute binding, respectively. Yu <em>et al.</em> <d-cite key="yu_characterizing_2023"></d-cite>, Nanda <em>et al.</em> <d-cite key="nanda_fact_2023"></d-cite>, Lv <em>et al.</em> <d-cite key="lv_interpreting_2024"></d-cite>, Chughtai <em>et al.</em> <d-cite key="chughtai_summing_2024"></d-cite>, and Ortu <em>et al.</em> <d-cite key="ortu_competition_2024"></d-cite> explore mechanisms for factual recall, revealing how circuits dynamically balance pre-trained knowledge with new contextual information. Lan <em>et al.</em> <d-cite key="lan_locating_2023"></d-cite> extend circuit analysis to sequence continuation tasks, identifying shared computational structures across semantically related sequences.

More promisingly, some repeating patterns have shown {% term universality %} across models and tasks. These universal patterns are called {% term motifs %} <d-cite key="olah_zoom_2020"></d-cite> and can manifest not just as specific circuits or features but also as higher-level behaviors emerging from the interaction of multiple components. Examples include the curve detectors found across vision models <d-cite key="cammarata_curve_2021,cammarata_curve_2020"></d-cite>, induction circuits enabling in-context learning <d-cite key="olsson_incontext_2022"></d-cite>, and the phenomenon of branch specialization in neural networks <d-cite key="voss_branch_2021"></d-cite>. Motifs may also capture how models leverage tokens for working memory or parallelize computations in a divide-and-conquer fashion across representations. The significance of motifs lies in revealing the common structures, mechanisms, and strategies that naturally emerge across neural architectures, shedding light on the fundamental building blocks underlying their intelligence. [Figure 6](#fig:motif) contrasts observed neural network models with hypothetical disentangled models, illustrating how a shared circuit pattern can emerge across different models trained on similar tasks and data, hinting at an underlying {% term universality %}.

<div class="definition-box">
 <h4 class="definition-title">Motif</h4>
 <p class="definition-content">
   Motifs are repeated patterns within a network, encompassing either features or circuits that emerge across different models and tasks.
 </p>
</div>

#### Universality Hypothesis

Following the evidence for motifs, we can propose two versions for a {% term universality %} hypothesis regarding the convergence of features and circuits across neural network models:

<div class="hypothesis-box">
 <h4 class="hypothesis-title">Weak Universality</h4>
 <p class="hypothesis-content">
   There are underlying principles governing how neural networks learn to solve certain tasks. Models will generally converge on analogous solutions that adhere to the common underlying principles. However, the specific {% term features %} and {% term circuits %} that implement these principles can vary across different models based on factors like hyperparameters, random seeds, and architectural choices. 
 </p>
</div>

<div class="hypothesis-box">
 <h4 class="hypothesis-title">Strong Universality</h4>
 <p class="hypothesis-content">
   The <em>same</em> core features and circuits will universally and consistently arise across all neural network models trained on similar tasks and data distributions and using similar techniques, reflecting a set of fundamental computational {% term motifs %} that neural networks inherently gravitate towards when learning.
 </p>
</div>

The universality hypothesis posits a convergence in forming features and circuits across various models and tasks, which could significantly ease interpretability efforts in AI. It proposes that artificial and biological neural networks share similar features and circuits, suggesting a standard underlying structure <d-cite key="chan_natural_2023,sucholutsky_getting_2023,kornblith_similarity_2019"></d-cite>. This idea posits that there is a fundamental basis in how neural networks, irrespective of their specific configurations, process and comprehend information. This could be due to inbuilt inductive biases in neural networks or {% term natural abstractions %} <d-cite key="chan_natural_2023"></d-cite> — concepts favored by the natural world that any cognitive system would naturally gravitate towards.

Evidence for this hypothesis comes from *cross-species neural structures* in neuroscience, where similar neural structures and functions are found in different species <d-cite key="kirchner_neuroscience_2023"></d-cite>. Additionally, machine learning models, including neural networks, tend to converge on similar features, representations, and classifications across different tasks and architectures <d-cite key="chen_going_2023,hacohen_let_2019,li_convergent_2015,bricken_monosemanticity_2023"></d-cite>. Marchetti <em>et al.</em> <d-cite key="marchetti_harmonics_2023"></d-cite> provide mathematical support for emerging universal features. 

While various studies support the universality hypothesis, questions remain about the extent of feature and circuit similarity across different models and tasks. In the context of mechanistic interpretability, this hypothesis has been investigated for neurons <d-cite key="gurnee_universal_2024"></d-cite>, group composition circuits <d-cite key="chughtai_toy_2023"></d-cite>, and modular task processing <d-cite key="variengien_look_2023"></d-cite>, with evidence for the weak but not the strong formulation <d-cite key="chughtai_toy_2023"></d-cite>.

### Emergence of World Models and Simulated Agents

#### Internal World Models

World models are internal causal models of an environment formed within neural networks. Traditionally linked with reinforcement learning, these models are *explicitly* trained to develop a compressed spatial and temporal representation of the training environment, enhancing downstream task performance and sample efficiency through training on internal hallucinations <d-cite key="ha_recurrent_2018"></d-cite>. However, in the context of our survey, our focus shifts to {% term internal world models %} that potentially form *implicitly* as a by-product of the training process, especially in LLMs trained on next-token prediction — also called GPT.

LLMs are sometimes characterized as *stochastic parrots* <d-cite key="bender_dangers_2021"></d-cite>. This label stems from their fundamental operational mechanism of predicting the next word in a sequence, which is seen as relying heavily on memorization. From this viewpoint, LLMs are thought to form complex correlations based on observational data but lack the ability to develop causal models of the world due to their lack of access to interventional data <d-cite key="pearl_causality_2009"></d-cite>.

An alternative perspective on LLMs comes from the active inference framework <d-cite key="salvatori_braininspired_2023"></d-cite>, a theory rooted in cognitive science and neuroscience. Active inference postulates that the objective of minimizing prediction error, given enough representative capacity, is adequate for a learning system to develop complex world representations, behaviors, and abstractions. Since language inherently mirrors the world, these models could implicitly construct linguistic and broader world models <d-cite key="kulveit_predictive_2023"></d-cite>.

The {% term simulation %} hypothesis suggests that models designed for prediction, such as LLMs, will eventually simulate the causal processes underlying data creation. Seen as an extension of their drive for efficient compression, this hypothesis implies that adequately trained models like GPT could develop {% term internal world models %} as a natural outcome of their predictive training <d-cite key="janus_simulators_2022,shanahan_role_2023"></d-cite>.

<div class="hypothesis-box">
 <h4 class="hypothesis-title">Simulation</h4>
 <p class="hypothesis-content">
   A model whose objective is text prediction will simulate the causal processes underlying the text creation if optimized sufficiently strongly <d-cite key="janus_simulators_2022"></d-cite>.
 </p>
</div>

In addition to theoretical considerations for emergent causal world models <d-cite key="richens_robust_2024,nichani_how_2024"></d-cite>, mechanistic interpretability is starting to provide empirical evidence on the types of internal world models that may emerge in LLMs. The ability to internally represent the board state in games like chess <d-cite key="karvonen_emergent_2024"></d-cite> or Othello <d-cite key="li_emergent_2023,nanda_emergent_2023"></d-cite>, create linear abstractions of spatial and temporal data <d-cite key="gurnee_language_2023"></d-cite>, and structure complex representations of mazes, demonstrating an understanding of maze topology and pathways <d-cite key="ivanitskiy_structured_2023"></d-cite> highlight the growing abstraction capabilities of LLMs. Li <em>et al.</em> <d-cite key="li_implicit_2021"></d-cite> identified contextual word representations that function as models of entities and situations evolving throughout a discourse, akin to linguistic models of dynamic semantics. Patel <em>et al.</em> <d-cite key="patel_mapping_2022"></d-cite> demonstrated that LLMs can map conceptual domains (e.g., direction, color) to grounded world representations given a few examples, suggesting they learn rich conceptual spaces <d-cite key="gardenfors_conceptual_2004"></d-cite> reflective of the non-linguistic world.

The {% term prediction orthogonality %} hypothesis further expands on this idea: It posits that prediction-focused models like GPT may simulate agents with various objectives and levels of optimality. In this context, GPT are simulators, simulating entities known as {% term simulacra %} that can be either agentic or non-agentic, with different objectives from the simulator itself <d-cite key="janus_simulators_2022,shanahan_role_2023"></d-cite>. The implications of the simulation and prediction orthogonality hypotheses for AI safety and alignment are discussed in [Section 6](#relevance-to-ai-safety).

<div class="hypothesis-box">
 <h4 class="hypothesis-title">Prediction Orthogonality</h4>
 <p class="hypothesis-content">
   A model whose objective is prediction can simulate agents who optimize toward any objectives with any degree of optimality <d-cite key="janus_simulators_2022"></d-cite>.
 </p>
</div>

In conclusion, the evolution of LLMs from simple predictive models to entities potentially possessing complex {% term internal world models %}, as suggested by the {% term simulation %} hypothesis and supported by mechanistic interpretability studies, represents a significant shift in our understanding of these systems. This evolution challenges us to reconsider LLMs' capabilities and future trajectories in the broader landscape of AI development.

## Core Methods

Mechanistic interpretability (MI) employs various tools, from observational analysis to causal interventions. This section provides a comprehensive overview of these methods, beginning with a taxonomy that categorizes approaches based on their key characteristics ([Section 4.1](#taxonomy-of-mechanistic-interpretability-methods)). We then survey observational ([Section 4.2](#observation)), followed by interventional techniques ([Section 4.3](#intervention)). Finally, we study their synergistic interplay ([Section 4.4](#integrating-observation-and-intervention)). [Figure 7](#fig:methods) offers a visual summary of the methods and techniques unique to mechanistic interpretability.

<figure id="fig:methods">
 <img src="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/methods.png" alt="Overview of mechanistic interpretability methods" style="width: 100%;">
 <figcaption style="color: var(--global-text-color);">
   <strong>Figure 7:</strong> Overview of key methods and techniques in mechanistic interpretability research. Observational approaches include structured probes, logit lens variants, and sparse autoencoders (SAEs). Interventional methods, focusing on causal understanding, encompass activation patching variants for uncovering causal mechanisms and causal scrubbing for hypothesis evaluation.
   <a href="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/methods.pdf" target="_blank">(View PDF)</a>
 </figcaption>
</figure>

### Taxonomy of Mechanistic Interpretability Methods

We propose a taxonomy based on four key dimensions: causal nature, learning phase, locality, and comprehensiveness ([Table 1](#tab)).

The causal nature of methods ranges from purely observational, which analyze existing representations without direct manipulation, to interventional approaches that actively perturb model components to establish causal relationships. The learning phase dimension distinguishes between post-hoc techniques applied to trained models and intrinsic methods that enhance interpretability during the training process itself.

Locality refers to the scope of analysis, spanning from individual neurons (e.g., feature visualization) to entire model architectures (e.g., causal abstraction). Comprehensiveness varies from partial insights into specific components to holistic explanations of model behavior.

<div class="r-page-outset">
<table id="tab">
  <caption><strong>Table 1:</strong> Taxonomy of Mechanistic Interpretability Methods</caption>
  <thead>
    <tr>
      <th>Method</th>
      <th>Causal Nature</th>
      <th>Phase</th>
      <th>Locality</th>
      <th>Comprehensiveness</th>
      <th>Key Examples</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Feature Visualization</td>
      <td>Observation</td>
      <td>Post-hoc</td>
      <td>Local</td>
      <td>Partial</td>
      <td><d-cite key="zeiler_visualizing_2014"></d-cite>, <d-cite key="zimmermann_how_2021"></d-cite></td>
    </tr>
    <tr>
      <td>Exemplar methods</td>
      <td>Observation</td>
      <td>Post-hoc</td>
      <td>Local</td>
      <td>Partial</td>
      <td><d-cite key="grosse_studying_2023"></d-cite>, <d-cite key="garde_deepdecipher_2023"></d-cite></td>
    </tr>
    <tr>
      <td>Probing Techniques</td>
      <td>Observation</td>
      <td>Post-hoc</td>
      <td>Both</td>
      <td>Both</td>
      <td><d-cite key="mcgrath_acquisition_2022"></d-cite>, <d-cite key="gurnee_finding_2023"></d-cite></td>
    </tr>
    <tr>
      <td>Structured Probes</td>
      <td>Observation</td>
      <td>Post-hoc</td>
      <td>Both</td>
      <td>Both</td>
      <td><d-cite key="burns_discovering_2023"></d-cite></td>
    </tr>
    <tr>
      <td>Logit Lens Variants</td>
      <td>Observation</td>
      <td>Post-hoc</td>
      <td>Global</td>
      <td>Partial</td>
      <td><d-cite key="nostalgebraist_interpreting_2020"></d-cite>, <d-cite key="belrose_eliciting_2023"></d-cite></td>
    </tr>
    <tr>
      <td>Sparse Autoencoders</td>
      <td>Observation</td>
      <td>Post-hoc</td>
      <td>Both</td>
      <td>Comprehensive</td>
      <td><d-cite key="cunningham_sparse_2024"></d-cite>, <d-cite key="bricken_monosemanticity_2023"></d-cite></td>
    </tr>
    <tr>
      <td>Activation Patching</td>
      <td>Intervention</td>
      <td>Post-hoc</td>
      <td>Local</td>
      <td>Partial</td>
      <td><d-cite key="meng_locating_2022"></d-cite>, <d-cite key="wang_interpretability_2023"></d-cite></td>
    </tr>
    <tr>
      <td>Path Patching</td>
      <td>Intervention</td>
      <td>Post-hoc</td>
      <td>Both</td>
      <td>Both</td>
      <td><d-cite key="goldowsky-dill_localizing_2023"></d-cite></td>
    </tr>
    <tr>
      <td>Causal Abstraction</td>
      <td>Intervention</td>
      <td>Post-hoc</td>
      <td>Global</td>
      <td>Comprehensive</td>
      <td><d-cite key="geiger_causal_2023"></d-cite>, <d-cite key="geiger_finding_2023"></d-cite>, <d-cite key="wu_causal_2023"></d-cite></td>
    </tr>
    <tr>
      <td>Hypothesis Testing</td>
      <td>Intervention</td>
      <td>Post-hoc</td>
      <td>Global</td>
      <td>Comprehensive</td>
      <td><d-cite key="chan_causal_2022"></d-cite>, <d-cite key="jenner_comparison_2023"></d-cite></td>
    </tr>
    <tr>
      <td>Intrinsic Methods</td>
      <td>--</td>
      <td>Pre/During</td>
      <td>Global</td>
      <td>Comprehensive</td>
      <td><d-cite key="elhage_softmax_2022"></d-cite>, <d-cite key="liu_seeing_2023"></d-cite></td>
    </tr>
  </tbody>
</table>
</div>

The categorization is based on the methods' general tendencies. Some methods can offer local and global or partial and comprehensive interpretability depending on the scope of the analysis and application. Probing techniques can range from local to global and partial to comprehensive; simple linear probes might offer local insights into individual {% term features %}, while more sophisticated structured probes can uncover global patterns. Sparse autoencoders decompose individual neuron activations (local) but aim to disentangle features across the entire model (global). Path patching extends local interventions to global model understanding by tracing information flow across layers, demonstrating how local perturbations can yield broader insights.

In practice, mechanistic interpretability research involves both method development and their application. When applying methods to understand a model, combining techniques from multiple categories is often necessary and beneficial to build a more comprehensive understanding ([Section 4.4](#integrating-observation-and-intervention)).


### Observation

Mechanistic interpretability draws from observational methods that analyze the inner workings of neural networks, with many of these methods preceding the field itself. For a detailed exploration of inner interpretability methods, refer to <d-cite key="rauker_transparent_2023"></d-cite>. Two prominent categories are example-based methods and feature-based methods:

- **Example-based methods** identify real input examples that highly activate specific neurons or layers. This helps pinpoint influential data points that maximize neuron activation within the neural network <d-cite key="grosse_studying_2023,garde_deepdecipher_2023,nanfack_adversarial_2024"></d-cite>.
- **Feature-based methods** encompass techniques that generate synthetic inputs to optimize neuron activation. These neuron visualization techniques reveal how neurons respond to stimuli and which features are sensitive to <d-cite key="zeiler_visualizing_2014,zimmermann_how_2021"></d-cite>. By understanding the synthetic inputs that drive neuron behavior, we can hypothesize about the features encoded by those neurons.

#### Probing for Features

Probing involves training a classifier using the activations of a model, with the classifier's performance subsequently observed to deduce insights about the model's behavior and internal representations <d-cite key="alain_understanding_2016,hewitt_structural_2019"></d-cite>. As highlighted by Belinkov <em>et al.</em> <d-cite key="belinkov_probing_2021"></d-cite>, this technique faces a notable challenge: the probe's performance may often reflect its own learning capacities more than the actual characteristics of the model's representations. This dilemma has led researchers to investigate the ideal balance between the complexity of a probe and its capacity to accurately represent the model's features <d-cite key="cao_lowcomplexity_2021,voita_informationtheoretic_2020"></d-cite>.

The {% term linear representation %} hypothesis offers a resolution to this issue. Under this hypothesis, the failure of a simple linear probe to detect certain features suggests their absence in the model's representations. Conversely, if a more complex probe succeeds where a simpler one fails, it implies that the model contains features that a complex function can combine into the target feature. Still, the target feature itself is not explicitly represented. This hypothesis implies that using linear probes could suffice in most cases, circumventing the complexity considerations generally associated with probing <d-cite key="belinkov_probing_2021"></d-cite>.

Probing has been used to analyze the acquisition of chess knowledge in AlphaZero <d-cite key="mcgrath_acquisition_2022"></d-cite>. Gurnee <em>et al.</em> <d-cite key="gurnee_finding_2023"></d-cite> introduce *sparse probing*, decoding internal neuron activations in large models to understand feature representation and sparsity. They show that early layers use sparse combinations of neurons to represent many features in superposition, while middle layers have dedicated {% term monosemantic %} neurons for higher-level contextual features.

A significant limitation of probing is the inability to draw behavioral or causal conclusions. The evidence provided by probing is mainly observational, focusing on what information is encoded rather than how it is used (also see [Figure 1](#fig:paradigms)). This necessitates careful analysis and possibly the adoption of alternative approaches <d-cite key="elazar_amnesic_2021"></d-cite> or the integration of intervention techniques to draw more substantive conclusions about the model's behavior ([Section 4.2](#intervention)).

#### Structured Probes

While focusing on bottom-up, mechanistic interpretability approaches, we can also consider integrating top-down, concept-based structured probes with mechanistic interpretability.

Structured probes aid conceptual interpretability, probing language models for complex features like truth representations. Notably, Burns <em>et al.</em>'s <d-cite key="burns_discovering_2023"></d-cite> contrast-consistent search (CCS) method identifies linear projections exhibiting logical consistency in hidden states, contrasting truth values for statements and negations.

However, structured probes face significant challenges in unsupervised probing scenarios. As Farquhar <em>et al.</em> <d-cite key="farquhar_challenges_2023"></d-cite> showed, arbitrary features, not just knowledge-related ones, can satisfy the CCS loss equally well, raising doubts about scalability. For example, the loss may capture {% term simulation %} of knowledge from hypothesized {% term simulacra %} within sufficiently powerful language models rather than the models' true knowledge. Furthermore, Farquhar <em>et al.</em> <d-cite key="farquhar_challenges_2023"></d-cite> demonstrates unsupervised methods like CCS often detect prominent but unintended features in the data, such as distractors like "banana." The discovered features are also highly sensitive to prompt choice, and there is no principled way to select prompts that would reliably surface a model's true knowledge.

While structured probes primarily focus on high-level conceptual representations <d-cite key="zou_representation_2023"></d-cite>, their findings could potentially inform or complement mechanistic interpretability efforts. For instance, identifying truth directions through structured probes could help guide targeted interventions or analyze the underlying circuits responsible for truthful behavior using mechanistic techniques such as activation patching or circuit tracing ([Section 4.2](#intervention)). Conversely, mechanistic methods could provide insights into how truth representations emerge and are computed within the model, addressing some of the challenges faced by unsupervised structured probes.

#### Logit Lens

The *logit lens* <d-cite key="nostalgebraist_interpreting_2020"></d-cite> provides a window into the model's predictive process by applying the final classification layer (which projects the residual stream activation into logits/vocabulary space) to intermediate activations of the residual stream, revealing how prediction confidence evolves across computational stages. This is possible because transformers tend to build their predictions across layers iteratively <d-cite key="geva_transformer_2022"></d-cite>. Extensions of this approach include the tuned lens <d-cite key="belrose_eliciting_2023"></d-cite>, which trains affine probes to decode hidden states into probability distributions over the vocabulary, and the Future Lens <d-cite key="pal_future_2023"></d-cite>, which explores the extent to which individual hidden states encode information about subsequent tokens.

Researchers have also investigated techniques that bypass intermediate computations to probe representations directly. Din <em>et al.</em> <d-cite key="din_jump_2023"></d-cite> propose using linear transformations to approximate hidden states from different layers, revealing that language models often predict final outputs in early layers. Dar <em>et al.</em> <d-cite key="dar_analyzing_2022"></d-cite> present a theoretical framework for interpreting transformer parameters by projecting them into the embedding space, enabling model alignment and parameter transfer across architectures.

Other techniques focus on interpreting specific model components or submodules. The DecoderLens <d-cite key="langedijk_decoderlens_2023"></d-cite> allows analyzing encoder-decoder transformers by cross-attending intermediate encoder representations in the decoder, shedding light on the information flow within the encoder. The Attention Lens <d-cite key="sakarvadia_attention_2023"></d-cite> aims to elucidate the specialized roles of attention heads by translating their outputs into vocabulary tokens via learned transformations.

#### Feature Disentanglement via Sparse Dictionary Learning 

As highlighted in [Section 3.1](#defining-features-as-representational-primitives), recent work suggests that the essential elements in neural networks are linear combinations of neurons representing features in superposition <d-cite key="elhage_toy_2022"></d-cite>. Sparse autoencoders provide a methodology to decompose neural network activations into these individual component features <d-cite key="sharkey_taking_2022,cunningham_sparse_2024"></d-cite>. This process involves reconstructing activation vectors as sparse linear combinations of directional vectors within the activation space, a problem also known as sparse dictionary learning <d-cite key="olshausen_sparse_1997"></d-cite>.

Sparse dictionary learning has led to the development of various sparse coding algorithms <d-cite key="lee_efficient_2006"></d-cite>. The sparse autoencoder stands out for its simplicity and scalability <d-cite key="sharkey_taking_2022"></d-cite>. The first application to a language model was by Yun <em>et al.</em> <d-cite key="yun_transformer_2021"></d-cite>, who implemented sparse dictionary learning across multiple layers of a language model.

Sparse autoencoders, a variant of the standard autoencoder framework, incorporate sparsity regularization to encourage learning sparse yet meaningful data representations. Theoretical foundations in the disentanglement literature suggest that autoencoders can recover ground truth features under feature sparsity and non-negativity <d-cite key="whittington_disentangling_2022"></d-cite>. The "ground truth features" here refer to the true, disentangled features that underlie the data distribution, which the autoencoder aims to recover through its sparse encoding. In the context of neural networks, these would correspond to the individual features combined to form neuron activations, which the sparse autoencoder attempts to disentangle and represent explicitly in its dictionary.

Practical implementations, such as the toy model by Sharkey <em>et al.</em> <d-cite key="sharkey_taking_2022"></d-cite>, demonstrate the viability of this approach, with the precise tuning of the sparsity penalty on the hidden activations being a critical aspect that dictates the sparsity level of the autoencoder. We show an overview in the pink box on sparse autoencoders in [Figure 8](#fig:sparse_autoencoder).

Empirical studies indicate that sparse autoencoders can enhance the interpretability of neural networks, exhibiting higher scores on the autointerpretability metric and increased monosemanticity <d-cite key="bricken_monosemanticity_2023,cunningham_sparse_2024,sharkey_taking_2022"></d-cite>. Furthermore, sparse autoencoders have been employed to measure feature sparsity <d-cite key="deng_measuring_2023"></d-cite> and interpret reward models in reinforcement learning-based language models <d-cite key="marks_interpreting_2023"></d-cite>, making them an actively researched area in mechanistic interpretability.

Evaluating the quality of sparse autoencoders remains challenging due to the lack of ground-truth interpretable features. Researchers have addressed this through various approaches: Karvonen <em>et al.</em> <d-cite key="karvonen_measuring_2024"></d-cite> proposed using language models trained on chess and Othello transcripts as testbeds, providing natural collections of interpretable features. Sharkey <em>et al.</em> <d-cite key="sharkey_taking_2022"></d-cite> constructed a toy model with traceable features, while Makelov <em>et al.</em> <d-cite key="makelov_principled_2024,makelov_sparse_2024"></d-cite> compared sparse autoencoder results with supervised features in large language models to demonstrate their viability.

The versatility of sparse autoencoders extends to various neural network architectures. They have been successfully applied to transformer attention layers <d-cite key="kissane_interpreting_2024"></d-cite> and convolutional neural networks <d-cite key="gorton_missing_2024"></d-cite>. Notably, Gorton <em>et al.</em> <d-cite key="gorton_missing_2024"></d-cite> applied sparse autoencoders to the early vision layers of InceptionV1, uncovering new interpretable features, including additional curve detectors not apparent from examining individual neurons <d-cite key="cammarata_curve_2020"></d-cite>.

In circuit discovery, sparse autoencoders have shown particular promise (see also [Section 4.3](#integrating-observation-and-intervention)). He <em>et al.</em> <d-cite key="he_dictionary_2024"></d-cite> proposed a circuit discovery framework alternative to activation patching (discussed in [Section 4.2.1](#activation-patching)), leveraging dictionary features decomposed from all modules writing to the residual stream. Similarly, O'Neill <em>et al.</em> <d-cite key="oneill_sparse_2024"></d-cite> employed discrete sparse autoencoders for discovering interpretable circuits in large language models.

Recent advancements have focused on improving sparse autoencoder performance and addressing limitations. Rajamanoharan <em>et al.</em> <d-cite key="rajamanoharan_improving_2024"></d-cite> introduced a gating mechanism to separate the functionalities of determining which directions to use and estimating their magnitudes, mitigating shrinkage -- the systematic underestimation of feature activations. An alternative approach by Dunefsky <em>et al.</em> <d-cite key="dunefsky_transcoders_2024"></d-cite> uses transcoders to faithfully approximate a densely activating MLP layer with a wider, sparsely-activating MLP layer, offering another path to interpretable feature discovery, a type of sparse distillation <d-cite key="slavachalnev_sparse_2024"></d-cite>.

<div class="explanation-box">
  <h4 class="explanation-title">Sparse Dictionary Learning</h4>
  <p class="explanation-content">
    Sparse autoencoders <d-cite key="cunningham_sparse_2024"></d-cite> represent a solution attempt to the challenge of {% term polysemantic %} neurons. The problem of {% term superposition %} is mathematically formalized as <em>sparse dictionary learning</em> <d-cite key="olshausen_sparse_1997"></d-cite> problem to decompose neural network activations into {% term disentangled %} component features. 
    
    The goal is to learn a dictionary of vectors $\{\mathbf{f}_k\}_{k=1}^{n_{\text{feat}}} \subset \mathbb{R}^d$ that can represent the unknown, ground truth network features as sparse linear combinations. If successful, the learned dictionary contains {% term monosemantic %} neurons corresponding to {% term features %} <d-cite key="sharkey_taking_2022"></d-cite>.
    
    The autoencoder architecture consists of an encoder and a ReLU activation function, expanding the input dimensionality to $d_{\text{hid}} > d_{\text{in}}$. The encoder's output is given by:

  <div>
  <p></p>
  <div class="math-block" style="text-align: center;">
   $\mathbf{h} = \text{ReLU}(\mathbf{W}_{\text{enc}}\mathbf{x}+\mathbf{b})$,</div>
  <p></p>
  </div>

  <div>
  <p></p>
     <div class="math-block" style="text-align: center;">
    ${\mathbf{x'}} = \mathbf{W}_{\text{dec}}\mathbf{h} = \sum_{i=0}^{d_{\text{hid}}-1} h_i \mathbf{f}_i 
    $,</div>
  <p></p>
  </div>

    where $\mathbf{W}_{\text{enc}}, \mathbf{W}_{\text{dec}}^T \in \mathbb{R}^{d_{\text{hid}} \times d_{\text{in}}}$ and $\mathbf{b} \in \mathbb{R}^{d_{\text{hid}}}$. The parameter matrix $\mathbf{W}_{\text{dec}}$ forms the feature dictionary, with rows $\mathbf{f}_i$ as dictionary features. The autoencoder is trained to minimize the loss, where the $L^1$ penalty on $\mathbf{h}$ encourages sparse reconstructions using the dictionary features,

  <div>
  <p></p>
<div class="math-block" style="text-align: center;">$\mathcal{L}(\mathbf{x}) = ||\mathbf{x} - {\mathbf{x'}}||_2^2 + \alpha ||\mathbf{h}||_1.$</div>
  <p></p>
  </div>

    <figure id="fig:sparse_autoencoder">
      <div class="center-figure">
        <img src="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/sae.png" alt="Sparse autoencoder" style="width: 80%;">
      </div>
      <figcaption>
        <strong>Figure 8:</strong> Illustration of a sparse autoencoder applied to the MLP layer activations, consisting of an encoder that increases dimensionality while emphasizing sparse representations and a decoder that reconstructs the original activations using the learned feature dictionary.
        <a href="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/sae.pdf" target="_blank">(View PDF)</a>
      </figcaption>
    </figure>
  </p>
</div>

### Intervention

#### Causality as a Theoretical Foundation

The theory of causality <d-cite key="pearl_causality_2009"></d-cite> provides a mathematically precise framework for mechanistic interpretability, offering a rigorous approach to understanding high-level semantics in neural representations <d-cite key="geiger_causal_2023"></d-cite>. By treating neural networks as causal models, with their *compute graphs serving as causal graphs*, researchers can perform precise interventions and examine the roles of individual parameters <d-cite key="mueller_quest_2024"></d-cite>. This causal perspective on interpretability has led to the development of various intervention techniques, including activation patching ([Section 4.2.1](#activation-patching)), causal abstraction ([Section 4.2.2](#causal-abstraction)), and hypothesis testing methods ([Section 4.2.3](#hypothesis-testing)).

#### Activation Patching

<figure id="fig:combined_patching">
  <div class="row">
    <div class="col-sm-6">
      <img src="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/patching.png" alt="Activation patching process" style="width:100%;">
    </div>
    <div class="col-sm-6">
      <img src="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/boolean_circuits.png" alt="Boolean circuits in activation patching" style="width:100%;">
    </div>
  </div>
  <figcaption style="color: var(--global-text-color);">
    <strong>Figure 9</strong>: <strong>(a)</strong> Activation patching in a transformer model. Left: The model processes the clean input "Colosseum in Rome," caching the latent activations (step i). Right: The model runs with the corrupted input "Eiffel Tower in Paris" (step ii). The pink arrow shows an MLP layer activation (green diamond) patched from the clean run into the corrupted run (step iii). This causes the prediction to change from "Paris" to "Rome," demonstrating how the significance of the patched component is determined (step iv). By comparing these carefully selected inputs, researchers can control for confounding circuitry and isolate the specific circuit responsible for the location prediction behavior.
    <strong>(b)</strong> Activation patching directions: <strong>Top</strong>: Patching corrupted activations (orange) into clean circuits (turquoise) reveals <em>sufficient</em> components for identifying OR logic scenarios. <strong>Bottom</strong>: Patching clean activations (green) into corrupted circuits (orange) reveals <em>necessary</em> components that are useful for identifying AND logic scenarios. The AND and OR gates demonstrate how these patching directions uncover different logical relationships between model components.
    <a href="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/patching.pdf" target="_blank">(View PDF)</a>
  </figcaption>
</figure>

Activation patching is a collective term for a set of causal intervention techniques that manipulate neural network activations to shed light on the decision-making processes within the model. These techniques, including causal tracing <d-cite key="meng_locating_2022"></d-cite>, interchange intervention <d-cite key="geiger_inducing_2021"></d-cite>, causal mediation analysis <d-cite key="vig_investigating_2020"></d-cite>, and causal ablation <d-cite key="wang_interpretability_2023"></d-cite>, share the common goal of modifying a neural model's internal state by replacing specific activations with alternative values, such as zeros, mean activations across samples, random noise, or activations from a different forward pass ([Figure 9a](#fig:combined_patching)).

The primary objective of activation patching is to isolate and understand the role of specific components or circuits within the model by observing how changes in activations affect the model's output. This enables researchers to infer the function and importance of those components. Key applications include localizing behavior by identifying critical activations, such as understanding the storage and processing of factual information <d-cite key="meng_locating_2022,geva_dissecting_2023,goldowsky-dill_localizing_2023,stolfo_mechanistic_2023"></d-cite>, and analyzing component interactions through circuit analysis to identify sub-networks within a model's computation graph that implement specified behaviors <d-cite key="wang_interpretability_2023,hanna_how_2023,lieberum_does_2023,hendel_incontext_2023,geva_dissecting_2023"></d-cite>.

The standard protocol for activation patching ([Figure 9a](#fig:combined_patching)) involves: (step i) running the model with a clean input and caching the latent activations; (step ii) executing the model with a corrupted input; (step iii) re-running the model with the corrupted input but substituting specific activations with those from the clean cache; and (step iv) determining significance by observing the variations in the model's output during the third step, thereby highlighting the importance of the replaced components. This process relies on comparing pairs of inputs: a clean input, which triggers the desired behavior, and a corrupted input, which is identical to the clean one except for critical differences that prevent the behavior. By carefully selecting these inputs, researchers can *control for confounding circuitry* and isolate the specific circuit responsible for the behavior.

Differences in patching direction—clean to corrupted (causal tracing) versus corrupted to clean (resample ablation)—provide insights into the sufficiency or necessity of model components for a given behavior. Clean to corrupted patching identifies activations sufficient for restoring clean performance, even if they are unnecessary due to redundancy, which is particularly informative in OR logic scenarios ([Figure 9b](#fig:combined_patching), OR gate). Conversely, corrupted to clean patching determines the necessary activations for clean performance, which is useful in AND logic scenarios ([Figure 9b](#fig:combined_patching), AND gate).

Activation patching can employ corruption methods, including zero-, mean-, random-, or resample ablation, each modulating the model's internal state in distinct ways. Resample ablation stands out for its effectiveness in maintaining consistent model behavior by not changing the data distribution too much <d-cite key="zhang_best_2023"></d-cite>. However, it is essential to be careful when interpreting the patching results, as breaking behavior by taking the model off-distribution is uninteresting for finding the relevant circuit <d-cite key="nanda_how_2023"></d-cite>.

#### Path Patching and Subspace Activation Patching

Path patching extends the activation patching approach to multiple edges in the computational graph <d-cite key="wang_interpretability_2023,goldowsky-dill_localizing_2023"></d-cite>, allowing for a more fine-grained analysis of component interactions. For example, path patching can be used to estimate the direct and indirect effects of attention heads on the output logits. Subspace activation patching, also known as distributed interchange interventions <d-cite key="geiger_finding_2023"></d-cite>, aims to intervene only on linear subspaces of the representation space where {% term features %} are hypothesized to be encoded, providing a tool for more targeted interventions.

Recently, Ghandeharioun <em>et al.</em> <d-cite key="ghandeharioun_patchscopes_2024"></d-cite> introduced *patchscopes*, a framework that unifies and extends activation patching techniques: using the model's text generation to explain internal representations, it enables more flexible interventions across various interpretability tasks, improving early layer inspection and allowing for cross-model analysis.

#### Limitations and Advancements

Activation patching has several limitations, including the effort required to design input templates and counterfactual datasets, the need for human inspection to isolate important subgraphs, and potential second-order effects that can complicate the interpretation of results <d-cite key="lange_interpretability_2023"></d-cite> and the {% term hydra effect %}  <d-cite key="mcgrath_hydra_2023,rushing_explorations_2024"></d-cite> (see discussion in [Section 7.2](#technical-limitations)). Recent advancements aim to address these limitations, such as automated circuit discovery algorithms <d-cite key="conmy_automated_2023"></d-cite>, gradient-based methods for scalable component importance estimation like attribution patching <d-cite key="nanda_attribution_2023,syed_attribution_2023"></d-cite>, and techniques to mitigate self-repair interferences during analysis <d-cite key="ferrando_information_2024"></d-cite>.

#### Causal Abstraction

Causal abstraction <d-cite key="geiger_causal_2021,geiger_causal_2023"></d-cite> provides a mathematical framework for mechanistic interpretability, treating neural networks and their explanations as causal models. This approach validates explanations through interchange interventions on network activations <d-cite key="jenner_comparison_2023"></d-cite>, unifying various interpretability methods such as LIME <d-cite key="ribeiro_why_2016"></d-cite>, causal effect estimation <d-cite key="feder_causalm_2021"></d-cite>, causal mediation analysis <d-cite key="vig_investigating_2020"></d-cite>, iterated nullspace projection <d-cite key="ravfogel_null_2020"></d-cite>, and circuit-based explanations <d-cite key="geiger_causal_2023"></d-cite>.

To overcome computational limitations, <em>distributed alignment search</em> (DAS) <d-cite key="geiger_finding_2023"></d-cite> introduced gradient-based distributed interchange interventions, extending causal abstraction to larger models like Alpaca <d-cite key="wu_interpretability_2023"></d-cite>. Further advancements include <em>causal proxy models</em> (CPMs) <d-cite key="wu_causal_2023"></d-cite>, which address the challenge of counterfactual observations.

Applications of causal abstraction span from linguistic phenomena analysis <d-cite key="arora_causalgym_2024,wu_causal_2022"></d-cite>, and evaluation of interpretability methods <d-cite key="huang_ravel_2024"></d-cite>, to improving performance through representation finetuning <d-cite key="wu_reft_2024"></d-cite>, and improving efficiency via model distillation <d-cite key="wu_causal_2022"></d-cite>. 

#### Hypothesis Testing

In addition to the causal abstraction framework, several methods have been developed for rigorous hypothesis testing about neural network behavior. These methods aim to formalize and empirically validate explanations of how neural networks implement specific behaviors.

*Causal scrubbing* <d-cite key="chan_causal_2022"></d-cite> formalizes hypotheses as a tuple $(\mathcal{G}, \mathcal{I}, c)$, where $\mathcal{G}$ is the model's computational graph, $\mathcal{I}$ is an interpretable computational graph hypothesized to explain the behavior, and $c$ maps nodes of $\mathcal{I}$ to nodes of $\mathcal{G}$. This method replaces activations in $G$ with others that should be equivalent according to the hypothesis, measuring performance on the scrubbed model to validate the hypothesis.

*Locally consistent abstractions* <d-cite key="jenner_comparison_2023"></d-cite> offer a more permissive approach, checking the consistency between the neural network and the explanation only one step away from the intervention node. This method forms a middle ground between the strictness of full causal abstraction and the flexibility of causal scrubbing.

These methods form a hierarchy of strictness, with full causal abstractions being the most stringent, followed by locally consistent abstractions and causal scrubbing being the most permissive. This hierarchy highlights trade-offs in choosing stricter or more permissive notions, affecting the ability to find acceptable explanations, generalization, and mechanistic anomaly detection.

### Integrating Observation and Intervention

To comprehensively understand internal neural network mechanisms, combining observational and interventional methods is crucial. For instance, sparse autoencoders can be used to disentangle superposed features <d-cite key="cunningham_sparse_2024"></d-cite>, followed by targeted activation patching to test the causal importance of these features <d-cite key="wang_interpretability_2023"></d-cite>. Similarly, the logit lens can track prediction formation across layers <d-cite key="nostalgebraist_interpreting_2020"></d-cite>, with subsequent interventions confirming causal relationships at key points. Probing techniques can identify encoded information <d-cite key="belinkov_probing_2021"></d-cite>, which can then be subjected to causal abstraction <d-cite key="geiger_causal_2023"></d-cite> to understand how this information is utilized. This iterative refinement process, where broad observational methods guide targeted interventions and intervention results inform further observations, enables a multi-level analysis that builds a holistic understanding across different levels of abstraction. Recent work by Marks <em>et al.</em> <d-cite key="marks_sparse_2024"></d-cite>, Bushnaq <em>et al.</em> <d-cite key="bushnaq_local_2024"></d-cite>, Braun <em>et al.</em> <d-cite key="braun_identifying_2024"></d-cite>, O'Neill <em>et al.</em> <d-cite key="oneill_sparse_2024"></d-cite>, and Ge <em>et al.</em> <d-cite key="ge_automatically_2024"></d-cite> demonstrates the potential of integrating sparse autoencoders with automated circuits discovery <d-cite key="conmy_automated_2023,syed_attribution_2023"></d-cite>, combining feature-level analysis with circuit-level interventions to uncover the interplay between representation and mechanism. By systematically combining these complementary methods, researchers can generate and rigorously test hypotheses about neural network behavior, addressing challenges such as feature {% term superposition %}.

## Current Research

This section surveys current research in mechanistic interpretability across three approaches based on when and how the model is interpreted during training: Intrinsic interpretability methods are applied before training to enhance the model's inherent interpretability ([Section 5.1](#intrinsic-interpretability)). Developmental interpretability involves studying the model's learning dynamics and the emergence of internal structures during training ([Section 5.2](#developmental-interpretability)). After training, post-hoc interpretability techniques are applied to gain insights into the model's behavior and decision-making processes ([Section 5.3](#post-hoc-interpretability)), including efforts towards uncovering general, transferable principles across models and tasks, as well as automating the discovery and interpretation of critical circuits in trained models ([Section 5.4](#automation-scaling-post-hoc-interpretability)).

<figure id="fig:interpretability_desiderata">
  <img src="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/desiderata.png" alt="Key desiderata for interpretability approaches" style="width: 100%;">
  <figcaption style="color: var(--global-text-color);">
    <strong>Figure 10:</strong> Key desiderata for interpretability approaches across training and analysis stages:
    (1) <strong>Intrinsic:</strong> Architectural biases for sparsity, {% term modularity %}, and {% term disentangled %} representations.
    (2) <strong>Developmental:</strong> Predictive capability for phase transitions, manageable number of critical transitions, and a unifying theory connecting observations to singularity geometry.
    (3) <strong>Post-hoc:</strong> Global, comprehensive, automated discovery of critical circuits, uncovering transferable principles across models/tasks, and extracting high-level causal mechanisms.
    <a href="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/desiderata.pdf" target="_blank">(View PDF)</a>
  </figcaption>
</figure>

### Intrinsic Interpretability

Intrinsic methods for mechanistic interpretability offer a promising approach to designing neural networks that are more amenable to {% term reverse engineering %} without sacrificing performance. By encouraging <em>sparsity</em>, {% term modularity %}, and <em>monosemanticity</em> through architectural choices and training procedures, these methods aim to make the reverse engineering process more tractable.

Intrinsic interpretability methods aim to constrain the training process to make learned programs more interpretable <d-cite key="friedman_learning_2023"></d-cite>. This approach is closely related to neurosymbolic learning <d-cite key="riegel_logical_2020"></d-cite> and can involve techniques like regularization with spatial structure, akin to the organization of information in the human brain <d-cite key="liu_seeing_2023,liu_growing_2023"></d-cite>.

Recent work has explored various architectural choices and training procedures to improve the interpretability of neural networks. Jermyn <em>et al.</em> <d-cite key="jermyn_engineering_2022"></d-cite> and Elhage <em>et al.</em> <d-cite key="elhage_softmax_2022"></d-cite> demonstrate that architectural choices can affect monosemanticity, suggesting that models could be engineered to be more {% term monosemantic %}. Sharkey <d-cite key="sharkey_technical_2023"></d-cite> propose using a bilinear layer instead of a linear layer to encourage monosemanticity in language models.

Liu <em>et al.</em> <d-cite key="liu_seeing_2023,liu_growing_2023"></d-cite> introduce a biologically inspired spatial regularization regime called brain-inspired modular training for forming modules in networks during training. They showcase how this can help RNNs exhibit brain-like anatomical modularity without degrading performance, in contrast to naive attempts to use sparsity to reduce the cost of having more neurons per layer <d-cite key="jermyn_engineering_2022,bricken_monosemanticity_2023"></d-cite>.

Preceding the mechanistic interpretability literature, various works have explored techniques to improve interpretability, such as sparse attention <d-cite key="zhang_sparse_2021"></d-cite>, adding $L^1$ penalties to neuron activations <d-cite key="kasioumis_elite_2021,georgiadis_accelerating_2019"></d-cite>, and pruning neurons <d-cite key="frankle_lottery_2019"></d-cite>. These techniques have been shown to encourage sparsity, modularity, and disentanglement, which are essential aspects of intrinsic interpretability.

### Developmental Interpretability

Developmental interpretability examines the learning dynamics and emergence of internal structures in neural networks over time, focusing on the formation of {% term features %} and {% term circuits %}. This approach complements static analyses by investigating critical phase transitions corresponding to significant changes in model behavior or capabilities <d-cite key="jacob_emergent_2023,schaeffer_are_2023,wei_emergent_2022,simon_stepwise_2023"></d-cite>. While primarily a distinct field, developmental interpretability often intersects with mechanistic interpretability, as exemplified by Olsson <em>et al.</em>'s <d-cite key="olsson_incontext_2022"></d-cite> work. Their research, rooted in mechanistic interpretability, demonstrated how the emergence of in-context learning relates to specific training phase transitions, connecting microscopic changes (induction heads) with macroscopic observables (training loss).

A key motivation for developmental interpretability is investigating the {% term universality %} of safety-critical patterns, aiming to understand how deeply ingrained and thereby resistant to safety fine-tuning capabilities like deception are. In addition, researchers hypothesize that emergent capabilities correspond to sudden circuit formation during training <d-cite key="michaud_quantization_2023"></d-cite>, potentially allowing for prediction or control of their development. 

Singular Learning Theory (SLT), developed by Watanabe <d-cite key="watanabe_algebraic_2009,watanabe_mathematical_2018"></d-cite>, provides a rigorous framework for understanding overparameterized models' behavior and generalization. By quantifying model complexity through the <em>local learning coefficient</em>, SLT offers insights into learning phase transitions and the emergence of structure in the model <d-cite key="lau_quantifying_2023"></d-cite>.  Recent work by Hoogland <em>et al.</em> <d-cite key="hoogland_stagewise_2024"></d-cite> applied this coefficient to identify developmental stages in transformer models, while Furman <em>et al.</em> <d-cite key="furman_estimating_2024"></d-cite> and Chen <em>et al.</em> <d-cite key="chen_dynamical_2023"></d-cite> advanced SLT's scalability and application to the toy model of {% term superposition %} ([Figure 4](#fig:superposition)), respectively.

While direct applications to phenomena such as generalization <d-cite key="zhang_understanding_2017"></d-cite>, learning functions with increasing complexity <d-cite key="nakkiran_sgd_2019"></d-cite>, and the transition from memorization to generalization ({% term grokking %}) <d-cite key="liu_understanding_2022,power_grokking_2022,liu_omnigrok_2022,nanda_progress_2023,varma_explaining_2023,thilak_slingshot_2022,merrill_tale_2023,liu_grokking_2023,stander_grokking_2023,wang_grokked_2024"></d-cite> are limited, these areas, along with neural scaling laws <d-cite key="caballero_broken_2022,liu_neural_2023,michaud_quantization_2023"></d-cite> (which can be connected to mechanistic insights <d-cite key="hernandez_scaling_2022"></d-cite>), represent promising future research directions.

In conclusion, developmental interpretability serves as an evolutionary theory lens for neural networks, offering insights into the emergence of structures and behaviors over time <d-cite key="saphra_interpretability_2023"></d-cite>. Drawing parallels from systems biology <d-cite key="alon_introduction_2019"></d-cite>, this approach can apply concepts like network {% term motifs %}, robustness, and {% term modularity %} to neural network development, explaining how functional capabilities arise. Sometimes, understanding how structures came about is easier than analyzing the final product, similar to how biologists find certain features in organisms easier to explain in light of their evolutionary history. By studying the temporal aspects of neural network training, researchers can potentially uncover fundamental principles of learning and representation that may not be apparent from examining static, trained models alone. 

### Post-Hoc Interpretability

In applied mechanistic interpretability, researchers explore various facets and methodologies to uncover the inner workings of AI models. Some key distinctions are drawn between <em>global</em> versus <em>local</em> interpretability and <em>comprehensive</em> versus <em>partial</em> interpretability. Global interpretability aims to uncover general patterns and behaviors of a model, providing insights that apply broadly across many instances <d-cite key="doshi-velez_rigorous_2017,nanda_how_2023"></d-cite>. In contrast, local interpretability explains the reasons behind a model's decisions for particular instances, offering insights into individual predictions or behaviors.

Comprehensive interpretability involves achieving a deep and exhaustive understanding of a model's behavior, providing a holistic view of its inner workings <d-cite key="nanda_how_2023"></d-cite>. In contrast, partial interpretability often applied to larger and more complex models, concentrates on interpreting specific aspects or subsets of the model's behavior, focusing on the application's most relevant or critical areas.

This multifaceted approach collectively analyzes specific capabilities in large models while enabling a comprehensive study of learned algorithms in smaller procedural networks.

#### Large Models — Narrow Behavior

Circuit-style mechanistic interpretability aims to explain neural networks by {% term reverse engineering %} the underlying mechanisms at the level of individual neurons or subgraphs. This approach assumes that neural vector representations encode high-level concepts and circuits defined by model weights encode meaningful algorithms <d-cite key="olah_zoom_2020,cammarata_curve_2020"></d-cite>. Studies on deep networks support these claims, identifying circuits responsible for detecting curved lines or object orientation <d-cite key="cammarata_curve_2020,cammarata_curve_2021,voss_branch_2021"></d-cite>.

This paradigm has been applied to language models to discover subnetworks (circuits) responsible for specific capabilities. Circuit analysis localizes and understands subgraphs within a model's computational graph responsible for specific behaviors. For large language models, this often involves narrow investigations into behaviors like multiple choice reasoning <d-cite key="lieberum_does_2023"></d-cite>, indirect object identification <d-cite key="wang_interpretability_2023"></d-cite>, or computing operations <d-cite key="hanna_how_2023"></d-cite>. Other examples include analyzing circuits for Python docstrings <d-cite key="heimersheim_circuit_2023"></d-cite>, "an" vs "a" usage <d-cite key="miller_we_2023"></d-cite>, and price tagging <d-cite key="wu_interpretability_2023"></d-cite>. Case studies often construct datasets using templates filled by placeholder values to enable precise control for causal interventions <d-cite key="wang_interpretability_2023,hanna_how_2023,wu_interpretability_2023"></d-cite>.

#### Toy Models — Comprehensive Analysis

Small models trained on specialized mathematical or algorithmic tasks enable more comprehensive reverse engineering of learned algorithms <d-cite key="nanda_progress_2023,zhong_clock_2023,chughtai_toy_2023"></d-cite>. Even simple arithmetic operations can involve complex strategies and multiple algorithmic solutions <d-cite key="nanda_progress_2023,zhong_clock_2023"></d-cite>. Characterizing these algorithms helps test hypotheses around generalizable mechanisms like variable binding <d-cite key="feng_how_2023,davies_discovering_2023"></d-cite> and arithmetic reasoning <d-cite key="stolfo_mechanistic_2023"></d-cite>. The work by Varma <em>et al.</em> <d-cite key="varma_explaining_2023"></d-cite> builds on the work that analyzes transformers trained on modular addition <d-cite key="nanda_progress_2023"></d-cite> and explains {% term grokking %} in terms of circuit efficiency, illustrating how a comprehensive understanding of a toy model can enable interesting analyses on top of that understanding.

#### Towards Universality

The ultimate goal is to uncover general principles that transfer across models and tasks, such as induction heads for in-context learning <d-cite key="olsson_incontext_2022"></d-cite>, variable binding mechanisms <d-cite key="feng_how_2023,davies_discovering_2023"></d-cite>, arithmetic reasoning <d-cite key="stolfo_mechanistic_2023,brinkmann_mechanistic_2024"></d-cite>, or retrieval tasks <d-cite key="variengien_look_2023"></d-cite>. Despite promising results, debates surround the {% term universality %} hypothesis – the idea that different models learn similar features and circuits when trained on similar tasks. Chughtai <em>et al.</em> <d-cite key="chughtai_toy_2023"></d-cite> finds mixed evidence for universality in group composition, suggesting that while families of circuits and features can be characterized, precise circuits and development order may be arbitrary.

#### Towards High-level Mechanisms

Causal interventions can extract a high-level understanding of computations and representations learned by large language models <d-cite key="variengien_look_2023,hendel_incontext_2023,feng_how_2023,zou_representation_2023"></d-cite>. Recent work focuses on intervening in internal representations to study high-level concepts and computations encoded. For example, Hendel <em>et al.</em> <d-cite key="hendel_incontext_2023"></d-cite> patched residual stream vectors to transfer task representations, while Feng and Steinhardt <d-cite key="feng_how_2023"></d-cite> intervened on residual streams to argue that models generate IDs to bind entities to attributes. Techniques for {% term representation engineering %} <d-cite key="zou_representation_2023"></d-cite> extract reading vectors from model activations to stimulate or inhibit specific concepts. Although these interventions don't operate via specific mechanisms, they offer a promising approach for extracting high-level causal understanding and bridging bottom-up and top-down interpretability approaches.

### Automation: Scaling Post-Hoc Interpretability {#automation-scaling-post-hoc-interpretability}

As models become more complex, automating key aspects of the interpretability workflow becomes increasingly crucial. Tracing a model's computational pathways is highly labor-intensive, quickly becoming infeasible as the model size increases. Automating the discovery of relevant circuits and their functional interpretation represents a pivotal step towards scalable and comprehensive model understanding <d-cite key="nainani_evaluating_2024"></d-cite>.

#### Dissecting Models into Interpretable Circuits

The first major automation challenge is identifying the critical computational sub-circuits or components underpinning a model's behavior for a given task. A pioneering line of work aims to achieve this via efficient <strong>masking</strong> or <strong>patching</strong> procedures. Methods like Automated Circuit Discovery (ACDC) <d-cite key="conmy_automated_2023"></d-cite> and Attribution Patching <d-cite key="syed_attribution_2023,kramar_atp_2024"></d-cite> iteratively knock out model activations, pinpointing components whose removal has the most significant impact on performance. This masking approach has proven scalable even to large models like Chinchilla (70B parameters) <d-cite key="lieberum_does_2023"></d-cite>.

Other techniques take a more top-down approach. Davies <em>et al.</em> <d-cite key="davies_discovering_2023"></d-cite> specify high-level causal properties (desiderata) that components solving a target subtask should satisfy and then learn binary masks to expose those component subsets. Ferrando and Voita <d-cite key="ferrando_information_2024"></d-cite> construct Information Flow Graphs highlighting key nodes and operations by tracing attribution flows, enabling extraction of general information routing patterns across prediction domains.

Explicit architectural biases like modularity can further boost automation efficiency. Nainani <em>et al.</em> <d-cite key="nainani_evaluating_2024"></d-cite> find that models trained with Brain-Inspired Modular Training (BIMT) <d-cite key="liu_seeing_2023"></d-cite> produce more readily identifiable circuits compared to standard training. Such domain-inspired inductive biases may prove increasingly vital as models grow more massive and monolithic.

#### Interpreting Extracted Circuits

Once critical circuit components have been isolated, the key remaining step is interpreting <em>what</em> computation those components perform. Sparse autoencoders are a prominent approach for interpreting extracted circuits by decomposing neural network activations into individual component {% term features %}, as discussed in [Section 4.1](#feature-disentanglement-via-sparse-dictionary-learning).

A novel paradigm uses large language models themselves as an interpretive tool. Bills <em>et al.</em> <d-cite key="bills_language_2023"></d-cite> demonstrate generating natural language descriptions of individual neuron functions by prompting language models like GPT-4 to explain sets of inputs that activate a neuron. Mousi <em>et al.</em> <d-cite key="mousi_can_2023"></d-cite> similarly employ language models to annotate unsupervised neuron clusters identified via hierarchical clustering. Bai <em>et al.</em> <d-cite key="bai_describeanddissect_2024"></d-cite> describe the roles of neurons in vision networks with multimodal models. These methods can easily leverage more capable general-purpose models in the future. Foote <em>et al.</em> <d-cite key="foote_neuron_2023"></d-cite> take a complementary graph-based approach in their neuron-to-graph tool: automatically extracting individual neurons' behavior patterns from training data as structured graphs amenable to visualization, programmatic comparisons, and property searches. Such representations could synergize with language model-based annotation to provide multi-faceted descriptions of neuron roles.

While impressive strides have been made, robustly interpreting the largest trillion-parameter models using these techniques remains an open challenge. Another novel approach, mechanistic-interpretability-based program synthesis <d-cite key="michaud_opening_2024"></d-cite>, entirely sidesteps this complexity by auto-distilling the algorithm learned by a trained model into human-readable Python code without relying on further interpretability analyses or model architectural knowledge. As models become increasingly vast and opaque, such synergistic combinations of methods — uncovering circuits, annotating them, or altogether transcribing them into executable code — will likely prove crucial for maintaining insight and {% term oversight %}.

## Relevance to AI Safety

### How Could Interpretability Promote AI Safety?

<figure id="fig:relevance">
  <img src="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/relevance.png" alt="Benefits and risks of mechanistic interpretability" style="width: 100%;">
  <figcaption style="color: var(--global-text-color);">
    <strong>Figure 11:</strong> Potential benefits and risks of mechanistic interpretability for AI safety. 
    <a href="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/relevance.pdf" target="_blank">(View PDF)</a>
  </figcaption>
</figure>

Gaining mechanistic insights into the inner workings of AI systems seems crucial for navigating AI safety as we develop more powerful models <d-cite key="nanda_longlist_2022"></d-cite>. Interpretability tools can provide an understanding of artificial cognition, the way AI systems process information and make decisions, which offers several potential benefits:

Mechanistic interpretability could accelerate AI safety research by providing richer feedback loops and grounding for model evaluation <d-cite key="casper_engineer_2023"></d-cite>. It may also help anticipate emergent capabilities, such as the emergence of new skills or behaviors in the model before they fully manifest <d-cite key="wei_emergent_2022,jacob_emergent_2023,nanda_progress_2023,barak_hidden_2022"></d-cite>. This relates to studying the incremental development of internal structures and representations as the model learns ([Section 5.2](#developmental-interpretability)). Additionally, interpretability could substantiate theoretical risk models with concrete evidence, such as demonstrating {% term inner misalignment %} (when a model's behavior deviates from its intended goals) or {% term mesa-optimization %} (the emergence of unintended subagents within the model) <d-cite key="hubinger_risks_2019,vonoswald_uncovering_2023"></d-cite>. It may also trigger normative shifts within the AI community toward rigorous safety protocols by revealing potential risks or concerning behaviors <d-cite key="hubinger_chris_2019"></d-cite>.

Regarding specific AI risks, interpretability may prevent malicious misuse by locating and erasing sensitive information stored in the model <d-cite key="meng_locating_2022,nguyen_survey_2022"></d-cite>. It could reduce competitive pressures by substantiating potential threats, promoting organizational safety cultures, and supporting AI alignment (ensuring AI systems pursue intended goals) through better monitoring and evaluation <d-cite key="hendrycks_xrisk_2022"></d-cite>. Interpretability can provide safety filters for every stage of training: before training by deliberate design <d-cite key="hubinger_chris_2019"></d-cite>, during training by detecting early signs of misalignment and potentially shifting the distribution towards alignment <d-cite key="hubinger_transparency_2022,sharkey_circumventing_2022"></d-cite>, and after training by rigorous evaluation of artificial cognition for honesty <d-cite key="burns_discovering_2023,zou_representation_2023"></d-cite> and screening for deceptive behaviors <d-cite key="park_ai_2023"></d-cite>.

The emergence of {% term internal world models %} in LLMs, as posited by the {% term simulation %} hypothesis, could have significant implications for AI alignment research. Finding an internal representation of human values and aiming the AI system's objective may be a trivial way to achieve alignment <d-cite key="wentworth_how_2022"></d-cite>, especially if the world model is internally separated from notions of goals and agency <d-cite key="ruthenis_internal_2022"></d-cite>. In such cases, world model interpretability alone may be sufficient for alignment <d-cite key="ruthenis_worldmodel_2023"></d-cite>.

Conditioning pre-trained models is considered a comparatively safe pathway towards general intelligence, as it avoids directly creating agents with inherent goals or agendas <d-cite key="jozdien_conditioning_2022,hubinger_conditioning_2023"></d-cite>. However, prompting a model to simulate an actual agent, such as "You are a superintelligence in 2035 writing down an alignment solution," could inadvertently lead to the formation of internal agents <d-cite key="hubinger_conditioning_2023"></d-cite>. In contrast, reinforcement learning tends to create agents by default <d-cite key="casper_open_2023,ngo_alignment_2022"></d-cite>.

The {% term prediction orthogonality %} hypothesis suggests that prediction-focused models like GPT can simulate agents with potentially misaligned objectives <d-cite key="janus_simulators_2022"></d-cite>. Although GPT may lack genuine agency or intentionality, it may produce outputs that simulate these qualities <d-cite key="bereska_taming_2023,shanahan_role_2023"></d-cite>. This underscores the need for careful {% term oversight %} and, better yet, using mechanistic interpretability to search for internal agents or their constituents, such as optimization or search processes -- an endeavor known as <em>searching for search</em> <d-cite key="nicholaskees_searching_2022,jenner_evidence_2024"></d-cite>.

Mechanistic interpretability integrates well into various AI alignment agendas, such as understanding existing models, controlling them, making AI systems solve alignment problems, and developing alignment theories <d-cite key="technicalities_shallow_2023,hubinger_overview_2020"></d-cite>. It could enhance strategies like detecting {% term deceptive alignment %} (when a model appears aligned but is actually pursuing different goals) <d-cite key="park_ai_2023"></d-cite>, {% term eliciting latent knowledge %} from models <d-cite key="christiano_eliciting_2021"></d-cite>, and enabling better scalable {% term oversight %}, such as in {% term iterative distillation and amplification %} <d-cite key="chan_what_2023"></d-cite>. A high degree of understanding may even allow for {% term well-founded AI %} approaches (AI systems with provable guarantees) <d-cite key="tegmark_provably_2023"></d-cite> or {% term microscope AI %} (extract world knowledge from the model without letting the model take actions) <d-cite key="hubinger_chris_2019"></d-cite>. Furthermore, comprehensive interpretability itself may be an alignment strategy if we can identify internal representations of human values and guide the model to pursue those values by retargeting an internal search process <d-cite key="wentworth_how_2022"></d-cite>. Ultimately, understanding and control are intertwined, and better understanding can lead to improved control of AI systems.

However, there is a spectrum of potential misalignment risks, ranging from acute, <em>model-centric</em> issues to gradual, <em>systemic</em> concerns <d-cite key="kulveit_risks_2024"></d-cite>. While mechanistic interpretability may address risks stemming directly from model internals -- such as deceptive alignment or sudden capability jumps -- it may be less helpful for tackling broader systemic risks like the emergence of misaligned economic structures or novel evolutionary dynamics <d-cite key="hendrycks_natural_2023"></d-cite>. The multi-scale risk landscape calls for a balanced research portfolio to minimize risk, where research on governance, complex systems, and multi-agent simulations complements mechanistic insights and model evaluations. The perceived utility of mechanistic interpretability for AI safety largely depends on researchers' priors regarding the likelihood of these different risk scenarios.

### How Could Mechanistic Insight Be Harmful?

Mechanistic interpretability research could accelerate AI capabilities, potentially leading to the development of powerful AI systems that are misaligned with human values, posing significant risks <d-cite key="soares_if_2023,nicholaskross_why_2023,hendrycks_xrisk_2022"></d-cite>. While historically, interpretability research had little impact on AI capabilities, recent exceptions like discoveries about scaling laws <d-cite key="hoffmann_training_2022"></d-cite>, architectural improvements inspired by studying induction heads <d-cite key="olsson_incontext_2022,fu_hungry_2022,poli_hyena_2023,schuster_confident_2022"></d-cite>, and efficiency gains inspired by the logit lens technique <d-cite key="schuster_confident_2022"></d-cite> demonstrated its potential impact. Scaling interpretability research may necessitate automation <d-cite key="conmy_automated_2023,bills_language_2023"></d-cite>, potentially enabling rapid self-improvement of AI systems <d-cite key="__ricg___agiautomated_2023"></d-cite>. Some researchers recommend selective publication and focusing on lower-risk areas to mitigate these risks <d-cite key="hobbhahn_should_2023,shovelain_riskreward_2023,elhage_toy_2022,nanda_progress_2023"></d-cite>.

Mechanistic interpretability also poses dual-use risks, where the same techniques could be used for both beneficial and harmful purposes. Fine-grained editing capabilities enabled by interpretability could be used for {% term machine unlearning %} (removing private data or dangerous knowledge from models) <d-cite key="guo_robust_2024,sun_learning_2024,nguyen_survey_2022,pochinkov_machine_2023"></d-cite> but could be misused for censorship. Similarly, while interpretability may help improve adversarial robustness <d-cite key="rauker_transparent_2023"></d-cite>, it may also facilitate the development of stronger adversarial attacks <d-cite key="mu_compositional_2020,casper_diagnostics_2023"></d-cite>.

Misunderstanding or overestimating the capabilities of interpretability techniques can divert resources from critical safety areas or lead to overconfidence and misplaced trust in AI systems <d-cite key="charbel-raphael_almost_2023,casper_engineer_2023"></d-cite>. Robust evaluation and benchmarking ([Section 8.2](#setting-standards)) are crucial to validate interpretability claims and reduce the risks of overinterpretation or misinterpretation.

## Challenges

### Research Issues

#### Need for Comprehensive, Multi-Pronged Approaches

Current interpretability research often focuses on individual techniques rather than combining complementary approaches. To achieve a holistic understanding of neural networks, we propose utilizing a diverse interpretability toolbox that integrates multiple methods (see also [Section 4.3](#integrating-observation-and-intervention)), such as: <em>i.</em> Coordinating observational (e.g., probing, logit lens) and interventional methods (e.g., activation patching) to establish causal relationships. <em>ii.</em> Combining feature-level analysis (e.g., sparse autoencoders) with circuit-level interventions (e.g., path patching) to uncover representation-mechanism interplay. <em>iii.</em> Integrating intrinsic interpretability approaches with post-hoc analysis for robust understanding. 

For example, coordinated methods could be used for {% term reverse engineering %} trojaned behaviors <d-cite key="casper_red_2023"></d-cite>, where observational techniques identify suspicious activations, interventional methods isolate the relevant circuits, and intrinsic approaches guide the design of more robust architectures.

#### Cherry-Picking and Streetlight Interpretability

Another concerning pattern is the tendency to cherry-pick results, relying on a small number of convincing examples or visualizations as the basis for an argument without comprehensive evaluation <d-cite key="rauker_transparent_2023"></d-cite>. This amounts to publication bias, showcasing an unrealistic highlight reel of best-case performance. Relatedly, many interpretability techniques are primarily evaluated on small toy models and tasks <d-cite key="chughtai_toy_2023,elhage_toy_2022,jermyn_engineering_2022,chen_dynamical_2023"></d-cite>, risking missing critical phenomena that only emerge in more realistic and diverse contexts. This focus on cherry-picked results from toy models is a form of {% term streetlight interpretability %} <d-cite key="casper_engineer_2023"></d-cite>, examining AI systems under only ideal conditions of maximal interpretability.

### Technical Limitations

#### Scalability Challenges and Risks of Human Reliance

A critical hurdle is demonstrating the scalability of mechanistic interpretability to real-world AI systems across model size, task complexity, behavioral coverage, and analysis efficiency <d-cite key="elhage_toy_2022,scherlis_polysemanticity_2023"></d-cite>. Achieving a truly comprehensive understanding of a model's capabilities in all contexts is daunting, and the time and compute required must scale tractably. Automating interpretability techniques is crucial, as manual analysis quickly becomes infeasible for large models. The high human involvement in current interpretability research raises concerns about the scalability and validity of human-generated model interpretations. Subjective, inconsistent human evaluations and lack of ground-truth benchmarks are known issues <d-cite key="rauker_transparent_2023"></d-cite>. As models scale, it will become increasingly untenable to rely on humans to hypothesize about model mechanisms manually. More work is needed on automating the discovery of mechanistic explanations and translating model weights into human-readable computational graphs <d-cite key="elhage_toy_2022"></d-cite>, but progress on that front may also come from outside the field <d-cite key="lu_ai_2024"></d-cite>.

#### Obstacles to Bottom-Up Interpretability

There are fundamental questions about the tractability of fully {% term reverse engineering %} neural networks from the bottom up, especially as models become more complex <d-cite key="hendrycks_introduction_2023"></d-cite>. Models may learn internal representations and algorithms that do not cleanly map to human-understandable concepts, making them difficult to interpret even with complete transparency <d-cite key="mcgrath_acquisition_2022"></d-cite>. This gap between human and model ontologies may widen as architectures evolve, increasing opaqueness <d-cite key="hendrycks_unsolved_2022"></d-cite>. Conversely, model representations might naturally converge to more human-interpretable forms as capability increases <d-cite key="hubinger_chris_2019,feng_how_2023"></d-cite>.

#### Analyzing Models Embedded in Environments

Real-world AI systems embedded in rich, interactive environments exhibit two forms of in-context behavior that pose significant interpretability challenges beyond understanding models in isolation. Externally, models may dynamically adapt to and reshape their environments through in-context learning from the interactions and feedback loops with their external environment <d-cite key="leahy_barriers_2023"></d-cite>. Internally, the {% term hydra effect %} demonstrates in-context reorganization, where models flexibly reorganize their internal representations in a context-dependent manner to maintain capabilities even after ablating key components <d-cite key="mcgrath_hydra_2023"></d-cite>. These two instances of in-context behavior — external adaptation to the environment and internal self-reorganization — undermine interpretability approaches that assume fixed {% term circuits %}. For models deeply embedded in rich real-world settings, their dynamic coupling with the external world via in-context environmental learning and their internal in-context representational reorganization make strong interpretability guarantees difficult to attain through analysis of the initial model alone.

#### Adversarial Pressure Against Interpretability

As models become more capable through increased training and optimization, there is a risk they may learn deceptive behaviors that actively obscure or mislead the interpretability techniques meant to understand them. Models could develop adversarial "mind-reader" components that predict and counteract the specific analysis methods used to interpret their inner workings <d-cite key="sharkey_circumventing_2022,hubinger_transparency_2022"></d-cite>. Optimizing models through techniques like gradient descent could inadvertently make their internal representations less interpretable to external observers <d-cite key="hubinger_gradient_2019,fu_transformers_2023,vonoswald_uncovering_2023"></d-cite>. In extreme cases, a highly advanced AI system singularly focused on preserving its core objectives may directly undermine the fundamental assumptions that enable interpretability methods in the first place.

These adversarial dynamics, where the capabilities of the AI model are pitted against efforts to interpret it, underscore the need for interpretability research to prioritize worst-case robustness rather than just average-case scenarios. Current techniques often fail even when models are not adversarially optimized. Achieving high confidence in fully understanding extremely capable AI models may require fundamental advances to make interpretability frameworks resilient against an intelligent system's active deceptive efforts.

## Future Directions

Given the current limitations and challenges, several key research problems emerge as critical for advancing mechanistic interpretability. These problems span four main areas: emphasizing conceptual clarity ([Section 1](#clarifying-concepts)), establishing rigorous standards ([Section 2](#setting-standards)), improving the scalability of interpretability techniques ([Section 3](#scaling-techniques)), and expanding the research scope ([Section 4](#expanding-scope)). Each subsection presents specific research questions and challenges that need to be addressed to move the field forward.

<figure id="fig:future">
  <img src="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/future.png" alt="Roadmap for advancing mechanistic interpretability research" style="width: 100%;">
  <figcaption style="color: var(--global-text-color);">
    <strong>Figure 1:</strong> Roadmap for advancing mechanistic interpretability research, highlighting key strategic directions.
    <a href="{{site.baseurl}}/assets/img/posts/2024-07-11-mechinterpreview/future.pdf" target="_blank">(View PDF)</a>
  </figcaption>
</figure>

## Clarifying Concepts

### Integrating with Existing Literature

To mature, mechanistic interpretability should embrace existing work, using established terminology rather than reinventing the wheel. Diverging terminology inhibits collaboration across disciplines. Presently, the terminology used for mechanistic interpretability partially diverges from mainstream AI research <d-cite key="casper_engineer_2023"></d-cite>. For example, while the mainstream speaks of *distributed representations* <d-cite key="hinton_distributed_1984,olah_distributed_2023"></d-cite> and the goal of {% term disentangled %} representations <d-cite key="higgins_definition_2018,locatello_challenging_2019"></d-cite>, the mechanistic interpretability literature refers to the same phenomenon as *polysemanticity* <d-cite key="scherlis_polysemanticity_2023,lecomte_incidental_2023,marshall_understanding_2024"></d-cite> and *superposition* <d-cite key="elhage_toy_2022,henighan_superposition_2023"></d-cite>. Using common language invites "accidental" contributions and prevents isolating mechanistic interpretability from broader AI research.

Mechanistic interpretability relates to many other fields in AI research, including compressed sensing <d-cite key="elhage_toy_2022"></d-cite>, modularity, adversarial robustness, continual learning, network compression <d-cite key="rauker_transparent_2023"></d-cite>, neurosymbolic reasoning, trojan detection, program synthesis <d-cite key="casper_engineer_2023,michaud_opening_2024"></d-cite>, and causal representation learning. These relationships can help develop new methods, metrics, benchmarks, and theoretical frameworks. For instance:

1. **Neurosymbolic Reasoning and Program Synthesis**: Mechanistic interpretability aims for {% term reverse engineering %} neural networks by converting their weights into human-readable algorithms. This endeavor can draw inspiration from neurosymbolic reasoning <d-cite key="riegel_logical_2020"></d-cite> and program synthesis. Techniques like creating programs in domain-specific languages <d-cite key="verma_programmatically_2019,verma_imitation-projected_2019,trivedi_learning_2021"></d-cite>, extracting decision trees <d-cite key="zhang_interpreting_2019"></d-cite> or symbolic causal graphs <d-cite key="ren_defining_2023"></d-cite> from neural networks align well with the goals of mechanistic interpretability. Adopting these approaches can extend the toolkit for reverse engineering AI systems.

2. **Causal Representation Learning**: Causal Representation Learning (CRL) aims to discover and disentangle underlying causal factors in data <d-cite key="scholkopf_causal_2021"></d-cite>, complementing mechanistic interpretability's goal of understanding causal structures within neural networks. While mechanistic interpretability typically examines individual {% term features %} and {% term circuits %}, CRL offers a framework for understanding high-level causal structures. CRL techniques could enhance interpretability by identifying causal relationships between neurons or layers <d-cite key="bengio_metatransfer_2019,ke_systematic_2021"></d-cite>, potentially revealing model reasoning. Its focus on interventions and counterfactuals <d-cite key="pearl_book_2018,peters_elements_2017"></d-cite> could inspire new methods for probing model internals <d-cite key="goyal_recurrent_2020,besserve_counterfactuals_2019"></d-cite>. CRL's emphasis on learning invariant representations <d-cite key="peters_causal_2015,kugelgen_semisupervised_2019"></d-cite> could guide the search for robust features, while its approach to transfer learning <d-cite key="rojas-carulla_invariant_2018,magliacane_domain_2018"></d-cite> could inform studies into model generalization.

3. **Trojan Detection**: Detecting deceptive alignment models is a key motivation for inspecting model internals, as -- by definition -- deception is not salient from observing behavior alone <d-cite key="casper_blackbox_2024"></d-cite>. However, quantifying progress is challenging due to the lack of evidence for deception as an emergent capability in current models <d-cite key="jacob_emergent_2023"></d-cite>, apart from {% term sycophancy %} <d-cite key="sharma_understanding_2023,denison_sycophancy_2024"></d-cite> and theoretical evidence for {% term deceptive inflation %} behavior <d-cite key="lang_when_2024"></d-cite>. Detecting trojans (or backdoors) <d-cite key="hubinger_sleeper_2024"></d-cite> implanted via data poisoning could be a proxy goal and proof-of-concept. These trojans simulate {% term outer misalignment %} (where the model's behavior is misaligned with the specified reward function or objectives due to poorly defined or incorrect reward signals) rather than {% term inner misalignment %} such as deceptive alignment (where the model appears aligned with the specified objectives but internally pursues different, misaligned goals). Moreover, activating a trojan typically results in an immediate change of behavior, while deception can be subtle, gradual, and, at first, entirely internal. Nevertheless, trojan detection can still provide a practical testbed for benchmarking interpretability methods <d-cite key="maloyan_trojan_2024"></d-cite>.

4. **Adversarial Robustness**: There is a duality between interpretability and adversarial robustness <d-cite key="elhage_toy_2022,rauker_transparent_2023,bereska_mechanistic_2024b"></d-cite>. More interpretable models tend to be more robust against adversarial attacks <d-cite key="jyoti_robustness_2022"></d-cite>, and vice versa, adversarially trained models are often more interpretable <d-cite key="engstrom_adversarial_2019"></d-cite>. For instance, techniques like input gradient regularization have been shown to simultaneously improve the interpretability of saliency maps and enhance adversarial robustness <d-cite key="ross_improving_2017,du_fighting_2021"></d-cite>. Furthermore, interpretability tools can help create more sophisticated adversaries <d-cite key="carter_activation_2019,casper_robust_2021"></d-cite>, improving our understanding of model internals. Viewing adversarial examples as inherent neural network {% term features %} <d-cite key="ilyas_adversarial_2019"></d-cite> rather than bugs also hints at alien features beyond human perception. Connecting mechanistic interpretability to adversarial robustness thus promises ways to gain theoretical insight, measure progress <d-cite key="casper_engineer_2023"></d-cite>, design inherently more robust architectures <d-cite key="fort_ensemble_2024"></d-cite>, and create interpretability-guided approaches for identifying (and mitigating) adversarial vulnerabilities <d-cite key="garcia-carrasco_detecting_2024"></d-cite>.

More details on the interplay between interpretability, robustness, modularity, continual learning, network compression, and the human visual system can be found in the review by <d-cite key="rauker_transparent_2023"></d-cite>.

### Corroborate or Refute Core Assumptions

Features are the fundamental units defining neural representations and enabling mechanistic interpretability's bottom-up approach <d-cite key="chan_what_2023"></d-cite>, but defining them involves assumptions requiring scrutiny, as they shape interpretations and research directions. Questioning hypotheses by seeking additional evidence or counter-examples is crucial.

The {% term linear representation %} hypothesis treats activation directions as features <d-cite key="park_linear_2023,nanda_emergent_2023,elhage_toy_2022"></d-cite>, but the emergence and necessity of linearity is unclear -- is it architectural bias or inherent? Stronger theory justifying linearity's necessity or counter-examples like autoencoders on uncorrelated data without intermediate linear layers <d-cite key="elhage_toy_2022"></d-cite> are needed. An alternative lens views features as polytopes from piecewise linear activations <d-cite key="black_interpreting_2022"></d-cite>, questioning if direction simplification suffices or added polytope complexity aids interpretability.

The {% term superposition %} hypothesis suggests that {% term polysemantic %} neurons arise from the network compressing and representing many features within its limited set of neurons <d-cite key="elhage_toy_2022"></d-cite>, but polysemanticity can also occur incidentally due to redundancy <d-cite key="lecomte_incidental_2023,marshall_understanding_2024,mcgrath_hydra_2023"></d-cite>. Understanding superposition's role could inform mitigating polysemanticity via regularization <d-cite key="lecomte_incidental_2023"></d-cite>. Superposition also raises open questions like operationalizing *computation in superposition* <d-cite key="vaintrob_mathematical_2024,hanni_mathematical_2024"></d-cite>, *attention head superposition* <d-cite key="elhage_toy_2022,jermyn_circuits_2023,lieberum_does_2023,gould_successor_2023"></d-cite>, representing feature clusters <d-cite key="elhage_toy_2022"></d-cite>, connections to adversarial robustness <d-cite key="elhage_toy_2022,garcia-carrasco_detecting_2024,bloom_features_2023"></d-cite>, anti-correlated feature organization <d-cite key="elhage_toy_2022"></d-cite>, and architectural effects <d-cite key="nanda_200superposition_2023"></d-cite>.

## Setting Standards

### Prioritizing Robustness over Capability Advancement

As the mechanistic interpretability community expands, it is essential to maintain the norm of not advancing AI capabilities while simultaneously establishing metrics necessary for the field's progress <d-cite key="rauker_transparent_2023"></d-cite>. Researchers should prioritize developing comprehensive tools for analyzing the worst-case performance of AI systems, ensuring robustness and reliability in critical applications. This includes focusing on adversarial tasks, such as backdoor detection and removal <d-cite key="lamparth_analyzing_2023,hubinger_sleeper_2024,wu_backdoorbench_2022"></d-cite>, and evaluating the accuracy of explanations in producing adversarial examples <d-cite key="goldowsky-dill_localizing_2023"></d-cite>.

### Establishing Metrics, Benchmarks, and Algorithmic Testbeds

A central challenge in mechanistic interpretability is the lack of rigorous evaluation methods. Relying solely on intuition can lead to conflating hypotheses with conclusions, resulting in cherry-picking and optimizing for best-case rather than average or worst-case performance <d-cite key="rudin_stop_2019,miller_explanation_2019,rauker_transparent_2023,casper_engineer_2023"></d-cite>. Current ad hoc practices and proxy measures <d-cite key="doshi-velez_rigorous_2017"></d-cite> risk over-optimization (Goodhart's law -- *When a measure becomes a target, it ceases to be a good measure*). Distinguishing correlation from causation is crucial, as interpretability illusions demonstrate that visualizations may be meaningless without causal linking <d-cite key="bolukbasi_interpretability_2021,friedman_interpretability_2023,olah_feature_2017"></d-cite>.

To advance the field, rigorous evaluation methods are needed. These should include: *(i)* assessing out-of-distribution inputs, as most current methods are only valid for specific examples or datasets <d-cite key="rauker_transparent_2023,ilyas_adversarial_2019,mu_compositional_2020,casper_red_2023,burns_discovering_2023"></d-cite>; *(ii)* controlling systems through edits, such as implanting or removing trojans <d-cite key="mazeika_how_2022"></d-cite> or targeted editing <d-cite key="ghorbani_neuron_2020,dai_knowledge_2022,meng_locating_2022,meng_massediting_2022,bau_gan_2018,hase_does_2023"></d-cite>; *(iii)* replacing components with simpler reverse-engineered alternatives <d-cite key="lindner_tracr_2023"></d-cite>; and *(iv)* comprehensive evaluation through replacing components with hypothesized circuits <d-cite key="quirke_increasing_2024"></d-cite>.

Algorithmic testbeds are essential for evaluating faithfulness <d-cite key="jacovi_faithfully_2020,hanna_have_2024"></d-cite> and falsifiability <d-cite key="leavitt_falsifiable_2020"></d-cite>. Tools like Tracr <d-cite key="lindner_tracr_2023"></d-cite> can provide ground truth labels for benchmarking search methods <d-cite key="goldowsky-dill_localizing_2023"></d-cite>, while toy models studying superposition in computation <d-cite key="vaintrob_mathematical_2024"></d-cite> and transformers on algorithmic tasks can quantify sparsity and test intrinsic methods. Recently, <d-cite key="thurnherr_tracrbench_2024,gupta_interpbench_2024"></d-cite> introduced datasets of transformer weights with known circuits for evaluating mechanistic interpretability techniques.

## Scaling Techniques

#### Broader and Deeper Coverage of Complex Models and Behaviors

A primary goal in scaling mechanistic interpretability is pushing the Pareto frontier between model and task complexity and the coverage of interpretability techniques <d-cite key="chan_what_2023"></d-cite>. While efforts have focused on larger models, it is equally crucial to scale to more complex tasks and provide comprehensive explanations essential for provable safety <d-cite key="tegmark_provably_2023,dalrymple_guaranteed_2024,gross_compact_2024"></d-cite> and enumerative safety <d-cite key="cunningham_sparse_2024,elhage_toy_2022"></d-cite> by ensuring models won't engage in dangerous behaviors like deception. Future work should aim for thorough {% term reverse engineering %} <d-cite key="quirke_understanding_2023"></d-cite>, integrating proven modules into larger networks <d-cite key="nanda_progress_2023"></d-cite>, and capturing sequences encoded in hidden states beyond immediate predictions <d-cite key="pal_future_2023"></d-cite>. Deepening analysis complexity is also key, validating the realism of toy models <d-cite key="elhage_toy_2022"></d-cite> and extending techniques like path patching <d-cite key="goldowsky-dill_localizing_2023,liu_seeing_2023"></d-cite> to larger language models. The field must move beyond small transformers on algorithmic tasks <d-cite key="nanda_progress_2023"></d-cite> and limited scenarios <d-cite key="friedman_interpretability_2023"></d-cite> to tackle more complex, realistic cases.

#### Towards Universality

As mechanistic interpretability matures, the field must transition from isolated empirical findings to developing overarching theories and universal reasoning primitives beyond specific circuits, aiming for a comprehensive understanding of AI capabilities. While collecting empirical data remains valuable <d-cite key="nanda_mechanistic_2023"></d-cite>, establishing motifs, empirical laws, and theories capturing universal model behavior aspects is crucial. This may involve finding more circuits/features <d-cite key="nanda_200circuits_2022,nanda_200features_2022"></d-cite>, exploring circuits as a lens for memorization/generalization <d-cite key="hanna_how_2023"></d-cite>, identifying primitive general reasoning skills <d-cite key="feng_how_2023"></d-cite>, generalizing specific findings to model-agnostic phenomena <d-cite key="merullo_mechanism_2023"></d-cite>, and investigating emergent model generality across neural network classes <d-cite key="ivanitskiy_structured_2023"></d-cite>. Identifying universal reasoning patterns and unifying theories is key to advancing interpretability.

#### Automation

Implementing automated methods is crucial for scaling interpretability of real-world state-of-the-art models across size, task complexity, behavior coverage, and analysis time <d-cite key="hobbhahn_marius_2022"></d-cite>. Manual circuit identification is labor-intensive <d-cite key="lieberum_does_2023"></d-cite>, so automated techniques like circuit discovery and sparse autoencoders can enhance the process <d-cite key="foote_neuron_2023,nanda_200tool_2023"></d-cite>. Future work should automatically create varying datasets for understanding circuit functionality <d-cite key="conmy_automated_2023"></d-cite>, develop automated hypothesis search <d-cite key="goldowsky-dill_localizing_2023"></d-cite>, and investigate attention head/MLP interplay <d-cite key="monea_glitch_2023"></d-cite>. Scaling sparse autoencoders to extract high-quality features automatically for frontier models is critical <d-cite key="bricken_monosemanticity_2023"></d-cite>. Still, it requires caution regarding potential downsides like AI iteration outpacing training <d-cite key="__ricg___agiautomated_2023"></d-cite> and loss of human interpretability from tool complexity <d-cite key="doshi-velez_rigorous_2017"></d-cite>.

### Expanding Scope

#### Interpretability Across Training

While mechanistic interpretability of final trained models is a prerequisite, the field should also advance interpretability before and during training by studying learning dynamics <d-cite key="nanda_200dynamics_2022,elhage_toy_2022,hubinger_transparency_2022"></d-cite>. This includes tracking neuron development <d-cite key="liu_probing_2021"></d-cite>, analyzing neuron set changes with scale <d-cite key="michaud_quantization_2023"></d-cite>, and investigating emergent computations <d-cite key="quirke_understanding_2023"></d-cite>. Studying phase transitions could yield safety insights for {% term reward hacking %} risks <d-cite key="olsson_incontext_2022"></d-cite>. 

#### Multi-Level Analysis

Complementing the predominant bottom-up methods <d-cite key="hanna_how_2023"></d-cite>, mechanistic interpretability should explore top-down and hybrid approaches, a promising yet neglected avenue. The top-down analysis offers a tractable way to study large models and guide microscopic research with macroscopic observations <d-cite key="variengien_look_2023"></d-cite>. Its computational efficiency could enable extensive "comparative anatomy" of diverse models, revealing high-level motifs underlying abilities. These motifs could serve as analysis units for understanding internal modifications from techniques like instruction fine-tuning <d-cite key="ouyang_training_2022"></d-cite> and reinforcement learning from human feedback <d-cite key="christiano_deep_2017,bai_training_2022"></d-cite>. 

#### New Frontiers: Vision, Multimodal, and Reinforcement Learning Models

While some mechanistic interpretability has explored convolutional neural networks for vision <d-cite key="cammarata_curve_2021,cammarata_curve_2020"></d-cite>, vision-language models <d-cite key="palit_visionlanguage_2023,salin_are_2022,hilton_understanding_2020"></d-cite>, and multimodal neurons <d-cite key="goh_multimodal_2021"></d-cite>, little work has focused on vision transformers <d-cite key="palit_visionlanguage_2023,aflalo_vl-interpret_2022,vilas_analyzing_2023,pan_dissecting_2024"></d-cite>. Future efforts could identify mechanisms within vision-language models, mirroring progress in unimodal language models <d-cite key="nanda_progress_2023,wang_interpretability_2023"></d-cite>. 

Reinforcement learning (RL) is also a crucial frontier given its role in advanced AI training via techniques like reinforcement learning from human feedback (RLHF) <d-cite key="christiano_deep_2017,bai_training_2022"></d-cite>, despite potentially posing significant safety risks <d-cite key="bereska_taming_2023,casper_open_2023"></d-cite>. Interpretability of RL should investigate reward/goal representations <d-cite key="mini_understanding_2023,colognese_high-level_2023,colognese_internal_2023,bloom_decision_2023,bloom_features_2023"></d-cite>, study circuitry changes from alignment algorithms <d-cite key="prakash_finetuning_2024,jain_mechanistically_2023,lee_mechanistic_2024,jain_what_2024"></d-cite>, and explore emergent subgoals or proxies <d-cite key="hubinger_risks_2019,ivanitskiy_structured_2023"></d-cite> such as internal reward models <d-cite key="marks_training_2023"></d-cite>. While current state-of-the-art AI systems as prediction-trained LLMs are considered relatively safe <d-cite key="hubinger_conditioning_2023"></d-cite>, progress on interpreting RL systems may prove critical for safeguarding the next paradigm <d-cite key="aschenbrenner_situational_2024"></d-cite>.


&nbsp;  
&nbsp; 
&nbsp;  
&nbsp; 
&nbsp;  