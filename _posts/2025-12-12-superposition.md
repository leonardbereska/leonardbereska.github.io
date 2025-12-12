---
layout: superposition 
title: "Superposition as Lossy Compression – Measure with Sparse Autoencoders and Connect to Adversarial Vulnerability"
description: "An information-theoretic framework quantifying superposition as lossy compression in neural networks. By measuring effective degrees of freedom through sparse autoencoders, we reveal that adversarial training's effect on feature organization depends on task complexity relative to network capacity."
tags: superposition, interpretability, adversarial-robustness, sparse-autoencoders
date: 2025-12-12
featured: false 

authors:
  - name: Leonard Bereska
    url: "https://leonardbereska.github.io/"
    affiliations:
      name: University of Amsterdam
  - name: Zoe Tzifa-Kratira
    affiliations:
      name: University of Amsterdam
  - name: Reza Samavi
    url: "https://www.ee.torontomu.ca/~samavi/"
    affiliations:
      name: Toronto Metropolitan University & Vector Institute
  - name: Efstratios Gavves
    url: "https://www.egavves.com/"
    affiliations:
      name: University of Amsterdam

bibliography: 2025-12-12-superposition.bib

toc:
  - name: Introduction
  - name: Background on Superposition and Sparse Autoencoders
    subsections:
      - name: Observing Superposition in Toy Models
      - name: Extracting Features Through Sparse Autoencoders
  - name: Measuring Superposition Through Information Theory
  - name: Validation of the Measurement Framework
    subsections:
      - name: Toy Model of Superposition
      - name: Dictionary Scaling Convergence
  - name: Applications and Findings
    subsections:
      - name: Dropout Reduces Features Through Redundant Encoding
      - name: Algorithmic Tasks Resist Superposition Despite Compression
      - name: Capturing Grokking Phase Transition
      - name: Layer-wise Organization in Language Models
  - name: Connection between Superposition and Adversarial Robustness
  - name: Limitations
  - name: Future Work
  - name: Conclusion
---

Neural networks achieve remarkable performance through <em>superposition</em>: encoding multiple features as overlapping directions in activation space rather than dedicating individual neurons to each feature. This phenomenon challenges interpretability; when neurons respond to multiple unrelated concepts, understanding network behavior becomes difficult. Yet despite its importance, we lack principled methods to measure superposition. We present an information-theoretic framework measuring a neural representation's <em>effective degrees of freedom</em>. We apply Shannon entropy to sparse autoencoder activations to compute the number of effective features as the minimum number of neurons needed for interference-free encoding. Equivalently, this measures how many "virtual neurons" the network simulates through superposition. When networks encode more effective features than they have actual neurons, they must accept interference as the price of compression. Our metric strongly correlates with ground truth in toy models, detects minimal superposition in algorithmic tasks (effective features approximately equal neurons), and reveals systematic reduction under dropout. Layer-wise patterns of effective features mirror studies of intrinsic dimensionality on Pythia-70M. The metric also captures developmental dynamics, detecting sharp feature consolidation during the grokking phase transition. Surprisingly, adversarial training can increase effective features while improving robustness, contradicting the hypothesis that superposition causes vulnerability. Instead, the effect of adversarial training on superposition depends on task complexity and network capacity: simple tasks with ample capacity allow feature expansion (abundance regime), while complex tasks or limited capacity force feature reduction (scarcity regime). By defining superposition as lossy compression, this work enables principled, practical measurement of how neural networks organize information under computational constraints, particularly connecting superposition to adversarial robustness.

## Introduction

Interpretability and adversarial robustness could be two sides of the same coin <d-cite key="rauker_transparent_2023"></d-cite>. Adversarially trained models learn more interpretable features <d-cite key="engstrom_adversarial_2019,ilyas_adversarial_2019"></d-cite>, develop representations that transfer better <d-cite key="salman_adversarially_2020"></d-cite>, and align more closely with human perception <d-cite key="santurkar_image_2019"></d-cite>. Conversely, interpretability-enhancing techniques improve robustness: input gradient regularization <d-cite key="ross_improving_2017,boopathy_proper_2020"></d-cite>, attribution smoothing <d-cite key="etmann_connection_2019"></d-cite>, and feature disentanglement <d-cite key="augustin_adversarial_2020"></d-cite> all defend against adversarial attacks. Even architectural choices that promote interpretability, such as lateral inhibition <d-cite key="eigen_topkconv_2021"></d-cite> and second-order optimization <d-cite key="tsiligkaridis_second_2020"></d-cite>, yield more robust models. This pervasive duality demands mechanistic explanation.

The superposition hypothesis offers a potential mechanism. Elhage *et al.* <d-cite key="elhage_toy_2022"></d-cite> showed that neural networks compress information through *superposition*: encoding multiple features as overlapping activation patterns. When features share dimensions, their interference creates attack surfaces that adversaries might exploit. If, by this mechanism, superposition caused adversarial vulnerability, this would explain *i.)* adversarial transferability as shared feature correlations <d-cite key="liu_delving_2017"></d-cite>, *ii.)* the robustness-accuracy trade-off as models sacrificing representational capacity for orthogonality <d-cite key="tsipras_robustness_2019"></d-cite>, and *iii.)* robust models becoming more interpretable by reducing feature entanglement <d-cite key="engstrom_adversarial_2019"></d-cite>. Also, this superposition-vulnerability hypothesis predicts that *adversarial training should reduce superposition*.

Testing this prediction requires measuring superposition in real networks. While Elhage *et al.* <d-cite key="elhage_toy_2022"></d-cite> used weight matrix Frobenius norms, this approach requires ground truth features; available only in toy models. We need principled methods to quantify superposition without knowing the true features.

We solve this through information theory applied to sparse autoencoders (SAEs). SAEs extract interpretable features from neural activations <d-cite key="cunningham_sparse_2024,bricken_monosemanticity_2023"></d-cite>, decomposing them into sparse dictionary elements. We measure each feature's share of the network's representational budget through its activation magnitude across samples.

The exponential of the Shannon entropy quantifies how many interference-free channels would transmit this feature distribution, the network's *effective degrees of freedom*. We call this count *effective features* $F$ (<a href="#fig:defining" class="figure-ref">Figure 2b</a>): the minimum neurons needed to encode the observed features without interference. We interpret this as $F$ "virtual neurons": the network simulates this many independent channels through its $N$ physical neurons (<a href="#fig:defining" class="figure-ref">Figure 2b</a>). The feature distribution compresses losslessly down to exactly $F$ neurons; compress further and interference becomes unavoidable.

We measure superposition as $\psi = F/N$ (<a href="#fig:defining" class="figure-ref">Figure 2c</a>), counting virtual neurons per physical neuron. At $\psi = 1$, the network operates at its interference-free limit (no superposition). At $\psi = 2$, it simulates twice as many channels as it has neurons, achieving 2× lossy compression. Thus, we define superposition as compression beyond the lossless limit.

<figure id="fig:defining">
<div class="row" style="align-items: center; --img-height: 124px;">
  <div class="col">
    <img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/neurons.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
  </div>
  <div class="col">
    <img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/features.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
  </div>
  <div class="col">
    <img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/definition.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
  </div>
</div>
  
  <figcaption style="color: var(--global-text-color);">
    <strong>Figure 1:</strong> Defining superposition for a neural network layer. 
    <strong>(a)</strong> Observed network with compressed representation where multiple features share neuronal dimensions. 
    <strong>(b)</strong> Hypothetical disentangled model where each effective feature occupies its own neuron without interference <d-cite key="elhage_toy_2022"></d-cite>. 
    <strong>(c)</strong> Superposition measure $\psi$ quantifies effective features per neuron. Here, the network simulates twice as many effective features as it has neurons. 
    Figure adapted from <d-cite key="bereska_mechanistic_2024"></d-cite>.
    (View PDFs: 
    <a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/neurons.pdf" target="_blank">(a)</a>
    <a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/features.pdf" target="_blank">(b)</a>
    <a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/definition.pdf" target="_blank">(c)</a>
    )
  </figcaption>
</figure>

Our findings contradict the simple superposition-vulnerability hypothesis. Adversarial training does not universally reduce superposition; its effect depends on task complexity relative to network capacity ([Section 6](#connection-between-superposition-and-adversarial-robustness)). Simple tasks with ample capacity permit *abundance*: networks expand features for robustness. Complex tasks under constraints force *scarcity*: networks compress further, reducing features. This bifurcation holds across architectures (MLPs, CNNs, ResNet-18) and datasets (MNIST, Fashion-MNIST, CIFAR-10).

We validate the framework where superposition is observable. Toy models achieve $r = 0.94$ correlation through the SAE extraction pipeline ([Section 4.1](#toy-model-of-superposition)), and under SAE dictionary scaling the measure converges with appropriate regularization ([Section 4.2](#dictionary-scaling-convergence)). Beyond adversarial training, systematic measurement across contexts generates hypotheses about neural organization: dropout seems to act as capacity constraint, reducing superposition ([Section 5.1](#dropout-reduces-features-through-redundant-encoding)), compressing networks trained on algorithmic tasks seems to not create superposition ($\psi \leq 1$) likely due to lack of input sparsity ([Section 5.2](#algorithmic-tasks-resist-superposition-despite-compression)), during grokking, we capture the moment of algorithmic discovery through sharp drop in superposition at the generalization transition ([Section 5.3](#capturing-grokking-phase-transition)), and Pythia-70M's layer-wise compression peaks in early MLPs before declining ([Section 5.4](#layer-wise-organization-in-language-models)); mirroring intrinsic dimensionality studies <d-cite key="ansuini_intrinsic_2019"></d-cite>.

This work makes superposition measurable. By grounding neural compression in information theory, we enable quantitative study of how networks encode information under capacity constraints, potentially enabling systematic engineering of interpretable architectures.
