<?php

namespace Application\HelloBundle\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class SonnetBaseTestCase extends WebTestCase
{
    protected $kernel;

    public function getKernel()
    {
        if( ! $this->kernel) {
            $this->kernel = $this->createKernel();
            $this->kernel->boot();
        }

        return $this->kernel;
    }

    /**
     * 操作SQL数据库
     */
    public function getEm()
    {
        $kernel = $this->getKernel();

        return $kernel->getContainer()->getDoctrine_Orm_DefaultEntityManagerService();
    }

    /**
     * 操作MongoDB数据库
     */
    public function getDm()
    {
        $kernel = $this->getKernel();

        return $kernel->getContainer()->getDoctrine_Odm_Mongodb_DefaultDocumentManagerService();
    }

}

