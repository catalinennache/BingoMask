-- phpMyAdmin SQL Dump
-- version 4.8.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 01, 2018 at 01:17 AM
-- Server version: 10.1.34-MariaDB
-- PHP Version: 7.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bingo`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts_balance`
--

CREATE TABLE `accounts_balance` (
  `idAccount` int(11) NOT NULL,
  `current_balance` int(11) DEFAULT NULL,
  `OOM` varchar(10) NOT NULL,
  `last_update` datetime NOT NULL,
  `account_token` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `idAccount` int(11) NOT NULL,
  `nickname` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `created_at` varchar(45) NOT NULL,
  `token` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`idAccount`, `nickname`, `email`, `password`, `created_at`, `token`) VALUES
(1, 'Beleaua', 'catalinenache03@gmail.com', 'digbick', '', 'asdfghjk');

-- --------------------------------------------------------

--
-- Table structure for table `customer_has_won_tickets`
--

CREATE TABLE `customer_has_won_tickets` (
  `idCustomer` int(11) NOT NULL,
  `idTicket` int(64) DEFAULT NULL,
  `ticket_representation` blob
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts_balance`
--
ALTER TABLE `accounts_balance`
  ADD PRIMARY KEY (`idAccount`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`idAccount`);

--
-- Indexes for table `customer_has_won_tickets`
--
ALTER TABLE `customer_has_won_tickets`
  ADD PRIMARY KEY (`idCustomer`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
